const asyncHandler = require("express-async-handler");
const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { logActivity, getIpAddress, getUserAgent } = require("../utils/logActivity");
const sendEmail = require("../utils/sendEmail");
const emailTemplates = require("../utils/emailTemplates");

/**
 * Expected CSV/Excel columns:
 * Required: name, email, role
 * For students: studentId, faculty, course, yearOfStudy, gender
 * Optional: phone, department, password, organizationCode (if not provided, uses admin's org)
 */

// Generate a random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Validate a single user row
const validateUserRow = (row, rowIndex) => {
  const errors = [];
  
  // Required fields for all users
  if (!row.name || !row.name.trim()) {
    errors.push(`Row ${rowIndex}: Name is required`);
  }
  
  if (!row.email || !row.email.trim()) {
    errors.push(`Row ${rowIndex}: Email is required`);
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
    errors.push(`Row ${rowIndex}: Invalid email format (${row.email})`);
  }
  
  const validRoles = ['student', 'admin', 'observer', 'candidate', 'agent'];
  const role = (row.role || 'student').toLowerCase().trim();
  if (!validRoles.includes(role)) {
    errors.push(`Row ${rowIndex}: Invalid role '${row.role}'. Valid roles: ${validRoles.join(', ')}`);
  }
  
  // Student-specific validation
  if (role === 'student') {
    if (!row.studentId || !row.studentId.toString().trim()) {
      errors.push(`Row ${rowIndex}: Student ID is required for students`);
    }
    if (!row.faculty || !row.faculty.trim()) {
      errors.push(`Row ${rowIndex}: Faculty is required for students`);
    }
    if (!row.course || !row.course.trim()) {
      errors.push(`Row ${rowIndex}: Course is required for students`);
    }
    if (!row.yearOfStudy || !row.yearOfStudy.toString().trim()) {
      errors.push(`Row ${rowIndex}: Year of study is required for students`);
    }
    const validGenders = ['Male', 'Female', 'Other'];
    const gender = row.gender ? row.gender.trim() : '';
    if (!gender || !validGenders.map(g => g.toLowerCase()).includes(gender.toLowerCase())) {
      errors.push(`Row ${rowIndex}: Gender is required for students (Male/Female/Other)`);
    }
  }
  
  return errors;
};

// Parse the uploaded file (CSV or Excel)
const parseFile = (buffer, filename) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with header row
  const data = XLSX.utils.sheet_to_json(sheet, { 
    defval: '', 
    raw: false,
    // Map common header variations to standard names
  });
  
  // Normalize column names (handle variations)
  return data.map(row => {
    const normalized = {};
    Object.keys(row).forEach(key => {
      const lowerKey = key.toLowerCase().trim().replace(/[\s_-]+/g, '');
      
      // Map common variations
      if (lowerKey === 'name' || lowerKey === 'fullname' || lowerKey === 'username') {
        normalized.name = row[key];
      } else if (lowerKey === 'email' || lowerKey === 'emailaddress') {
        normalized.email = row[key];
      } else if (lowerKey === 'role' || lowerKey === 'userrole') {
        normalized.role = row[key];
      } else if (lowerKey === 'studentid' || lowerKey === 'studentnumber' || lowerKey === 'stuid' || lowerKey === 'registrationnumber' || lowerKey === 'regno') {
        normalized.studentId = row[key];
      } else if (lowerKey === 'faculty') {
        normalized.faculty = row[key];
      } else if (lowerKey === 'course' || lowerKey === 'program' || lowerKey === 'programme') {
        normalized.course = row[key];
      } else if (lowerKey === 'yearofstudy' || lowerKey === 'year' || lowerKey === 'studyyear') {
        normalized.yearOfStudy = row[key];
      } else if (lowerKey === 'gender' || lowerKey === 'sex') {
        normalized.gender = row[key];
      } else if (lowerKey === 'phone' || lowerKey === 'phonenumber' || lowerKey === 'mobile' || lowerKey === 'tel') {
        normalized.phone = row[key];
      } else if (lowerKey === 'department' || lowerKey === 'dept') {
        normalized.department = row[key];
      } else if (lowerKey === 'password' || lowerKey === 'pwd') {
        normalized.password = row[key];
      } else if (lowerKey === 'organization' || lowerKey === 'org' || lowerKey === 'organizationcode' || lowerKey === 'orgcode' || lowerKey === 'university' || lowerKey === 'uni') {
        normalized.organizationCode = row[key];
      } else {
        // Keep original column for any other fields
        normalized[key] = row[key];
      }
    });
    return normalized;
  });
};

// Normalize gender to expected format
const normalizeGender = (gender) => {
  if (!gender) return null;
  const g = gender.toLowerCase().trim();
  if (g === 'male' || g === 'm') return 'Male';
  if (g === 'female' || g === 'f') return 'Female';
  if (g === 'other' || g === 'o') return 'Other';
  return gender; // Return as-is if no match
};

// @desc    Validate uploaded file (preview mode)
// @route   POST /api/admin/users/bulk-validate
// @access  Admin only
const validateBulkUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  
  try {
    const rows = parseFile(req.file.buffer, req.file.originalname);
    
    if (rows.length === 0) {
      res.status(400);
      throw new Error('File is empty or has no data rows');
    }
    
    const validationResults = {
      totalRows: rows.length,
      validRows: 0,
      invalidRows: 0,
      errors: [],
      preview: [],
      duplicateEmails: [],
      duplicateStudentIds: []
    };
    
    // Check for duplicates within the file
    const emailsSeen = {};
    const studentIdsSeen = {};
    
    // Also check for existing users in database
    const emails = rows.map(r => r.email?.toLowerCase().trim()).filter(Boolean);
    const studentIds = rows.map(r => r.studentId?.toString().trim()).filter(Boolean);
    
    const existingEmails = await User.find({ email: { $in: emails } }).select('email');
    const existingStudentIds = await User.find({ studentId: { $in: studentIds } }).select('studentId');
    
    const existingEmailSet = new Set(existingEmails.map(u => u.email.toLowerCase()));
    const existingStudentIdSet = new Set(existingStudentIds.map(u => u.studentId));
    
    rows.forEach((row, index) => {
      const rowIndex = index + 2; // Account for header row and 0-index
      const rowErrors = validateUserRow(row, rowIndex);
      
      const email = row.email?.toLowerCase().trim();
      const studentId = row.studentId?.toString().trim();
      
      // Check for duplicate emails within file
      if (email) {
        if (emailsSeen[email]) {
          rowErrors.push(`Row ${rowIndex}: Duplicate email '${email}' (also in row ${emailsSeen[email]})`);
        } else {
          emailsSeen[email] = rowIndex;
        }
        
        // Check if email exists in database
        if (existingEmailSet.has(email)) {
          rowErrors.push(`Row ${rowIndex}: Email '${email}' already exists in database`);
          validationResults.duplicateEmails.push({ row: rowIndex, email });
        }
      }
      
      // Check for duplicate student IDs within file
      if (studentId) {
        if (studentIdsSeen[studentId]) {
          rowErrors.push(`Row ${rowIndex}: Duplicate student ID '${studentId}' (also in row ${studentIdsSeen[studentId]})`);
        } else {
          studentIdsSeen[studentId] = rowIndex;
        }
        
        // Check if student ID exists in database
        if (existingStudentIdSet.has(studentId)) {
          rowErrors.push(`Row ${rowIndex}: Student ID '${studentId}' already exists in database`);
          validationResults.duplicateStudentIds.push({ row: rowIndex, studentId });
        }
      }
      
      if (rowErrors.length > 0) {
        validationResults.invalidRows++;
        validationResults.errors.push(...rowErrors);
      } else {
        validationResults.validRows++;
      }
      
      // Add to preview (first 50 rows)
      if (index < 50) {
        validationResults.preview.push({
          row: rowIndex,
          name: row.name,
          email: row.email,
          role: row.role || 'student',
          studentId: row.studentId,
          faculty: row.faculty,
          valid: rowErrors.length === 0,
          errors: rowErrors
        });
      }
    });
    
    res.json(validationResults);
  } catch (error) {
    console.error('File validation error:', error);
    res.status(400);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
});

// @desc    Import users from uploaded file
// @route   POST /api/admin/users/bulk-import
// @access  Admin only
const bulkImportUsers = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  
  const skipDuplicates = req.body.skipDuplicates === 'true';
  const sendWelcomeEmail = req.body.sendWelcomeEmail === 'true';
  const defaultOrganizationId = req.body.organization || req.user.organization;
  
  try {
    const rows = parseFile(req.file.buffer, req.file.originalname);
    
    if (rows.length === 0) {
      res.status(400);
      throw new Error('File is empty or has no data rows');
    }
    
    // Build organization code to ID map for rows that specify organization
    const orgCodes = [...new Set(rows.map(r => r.organizationCode?.toUpperCase().trim()).filter(Boolean))];
    const organizationMap = {};
    
    if (orgCodes.length > 0) {
      const orgs = await Organization.find({ code: { $in: orgCodes }, status: 'active' });
      orgs.forEach(org => {
        organizationMap[org.code] = org._id;
      });
    }
    
    const results = {
      total: rows.length,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [],
      importedUsers: []
    };
    
    // Get existing emails and student IDs
    const emails = rows.map(r => r.email?.toLowerCase().trim()).filter(Boolean);
    const studentIds = rows.map(r => r.studentId?.toString().trim()).filter(Boolean);
    
    const existingUsers = await User.find({
      $or: [
        { email: { $in: emails } },
        { studentId: { $in: studentIds } }
      ]
    }).select('email studentId');
    
    const existingEmailSet = new Set(existingUsers.map(u => u.email.toLowerCase()));
    const existingStudentIdSet = new Set(existingUsers.filter(u => u.studentId).map(u => u.studentId));
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 2;
      
      try {
        // Validate row
        const rowErrors = validateUserRow(row, rowIndex);
        
        const email = row.email?.toLowerCase().trim();
        const studentId = row.studentId?.toString().trim();
        
        // Check duplicates
        if (email && existingEmailSet.has(email)) {
          if (skipDuplicates) {
            results.skipped++;
            continue;
          } else {
            results.failed++;
            results.errors.push(`Row ${rowIndex}: Email '${email}' already exists`);
            continue;
          }
        }
        
        if (studentId && existingStudentIdSet.has(studentId)) {
          if (skipDuplicates) {
            results.skipped++;
            continue;
          } else {
            results.failed++;
            results.errors.push(`Row ${rowIndex}: Student ID '${studentId}' already exists`);
            continue;
          }
        }
        
        if (rowErrors.length > 0) {
          results.failed++;
          results.errors.push(...rowErrors);
          continue;
        }
        
        // Generate or use provided password
        const plainPassword = row.password?.trim() || generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        
        const role = (row.role || 'student').toLowerCase().trim();
        
        // Determine organization for this user
        let userOrganization = defaultOrganizationId;
        if (row.organizationCode) {
          const orgCode = row.organizationCode.toUpperCase().trim();
          if (organizationMap[orgCode]) {
            userOrganization = organizationMap[orgCode];
          } else {
            results.failed++;
            results.errors.push(`Row ${rowIndex}: Organization code '${orgCode}' not found or inactive`);
            continue;
          }
        }
        
        // Create user object
        const userData = {
          name: row.name.trim(),
          email: email,
          password: hashedPassword,
          role: role,
          organization: userOrganization,
          isVerified: true, // Auto-verify imported users
        };
        
        // Add student-specific fields
        if (role === 'student') {
          userData.studentId = studentId;
          userData.faculty = row.faculty.trim();
          userData.course = row.course.trim();
          userData.yearOfStudy = row.yearOfStudy.toString().trim();
          userData.gender = normalizeGender(row.gender);
        }
        
        // Optional fields
        if (row.phone) userData.phone = row.phone.trim();
        if (row.department) userData.department = row.department.trim();
        
        // Create user
        const user = await User.create(userData);
        
        // Add to existing sets to prevent duplicates within batch
        existingEmailSet.add(email);
        if (studentId) existingStudentIdSet.add(studentId);
        
        results.imported++;
        results.importedUsers.push({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: userOrganization,
          tempPassword: plainPassword // Used for welcome email
        });
        
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${rowIndex}: ${error.message}`);
      }
    }
    
    // Log the activity
    await logActivity({
      userId: req.user._id,
      action: 'BULK_USER_IMPORT',
      description: `Imported ${results.imported} users from file (${results.skipped} skipped, ${results.failed} failed)`,
      ip: getIpAddress(req),
      userAgent: getUserAgent(req),
      metadata: {
        filename: req.file.originalname,
        totalRows: results.total,
        imported: results.imported,
        skipped: results.skipped,
        failed: results.failed
      }
    });
    
    // Send welcome emails to all imported users
    if (sendWelcomeEmail && results.importedUsers.length > 0) {
      console.log(`[BULK IMPORT] Sending welcome emails to ${results.importedUsers.length} users...`);
      
      const emailResults = {
        sent: 0,
        failed: 0,
        errors: []
      };
      
      // Get organization names for email personalization
      const orgIds = [...new Set(results.importedUsers.map(u => u.organizationId).filter(Boolean))];
      const orgsMap = {};
      if (orgIds.length > 0) {
        const orgs = await Organization.find({ _id: { $in: orgIds } }).select('_id name');
        orgs.forEach(org => {
          orgsMap[org._id.toString()] = org.name;
        });
      }
      
      // Send emails in batches to avoid overwhelming the email service
      const BATCH_SIZE = 10;
      const BATCH_DELAY = 1000; // 1 second between batches
      
      for (let i = 0; i < results.importedUsers.length; i += BATCH_SIZE) {
        const batch = results.importedUsers.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (user) => {
          try {
            const organizationName = user.organizationId ? orgsMap[user.organizationId.toString()] : 'Campus Ballot';
            
            const emailContent = emailTemplates.bulkImportWelcome({
              userName: user.name,
              userEmail: user.email,
              password: user.tempPassword,
              role: user.role,
              organizationName: organizationName || 'Campus Ballot',
              loginUrl: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : 'https://campusballot.tech/login'
            });
            
            await sendEmail({
              to: user.email,
              subject: emailContent.subject,
              html: emailContent.html
            });
            
            emailResults.sent++;
            console.log(`[BULK IMPORT EMAIL] Welcome email sent to: ${user.email}`);
          } catch (emailError) {
            emailResults.failed++;
            emailResults.errors.push(`${user.email}: ${emailError.message}`);
            console.error(`[BULK IMPORT EMAIL ERROR] Failed to send to ${user.email}:`, emailError.message);
          }
        }));
        
        // Add delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < results.importedUsers.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }
      
      results.emailsSent = emailResults.sent;
      results.emailsFailed = emailResults.failed;
      if (emailResults.errors.length > 0) {
        results.emailErrors = emailResults.errors.slice(0, 10); // Limit error details
      }
      
      console.log(`[BULK IMPORT] Email sending complete: ${emailResults.sent} sent, ${emailResults.failed} failed`);
    }
    
    // Remove temp passwords from response (always remove for security)
    results.importedUsers = results.importedUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      emailSent: sendWelcomeEmail
    }));
    
    res.json({
      success: true,
      message: `Successfully imported ${results.imported} users${sendWelcomeEmail ? ` and sent ${results.emailsSent || 0} welcome emails` : ''}`,
      ...results
    });
    
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500);
    throw new Error(`Import failed: ${error.message}`);
  }
});

// @desc    Download sample template
// @route   GET /api/admin/users/bulk-template
// @access  Admin only
const downloadTemplate = asyncHandler(async (req, res) => {
  const format = req.query.format || 'csv';
  
  // Sample data
  const sampleData = [
    {
      name: 'John Doe',
      email: 'john.doe@university.edu',
      role: 'student',
      organizationCode: 'KYU',
      studentId: 'STU001',
      faculty: 'Engineering',
      course: 'Computer Science',
      yearOfStudy: '3',
      gender: 'Male',
      phone: '+256700000001',
      department: 'Computer Engineering'
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@university.edu',
      role: 'student',
      organizationCode: 'MAK',
      studentId: 'STU002',
      faculty: 'Science',
      course: 'Biology',
      yearOfStudy: '2',
      gender: 'Female',
      phone: '+256700000002',
      department: 'Life Sciences'
    },
    {
      name: 'Observer User',
      email: 'observer@university.edu',
      role: 'observer',
      organizationCode: '',
      studentId: '',
      faculty: '',
      course: '',
      yearOfStudy: '',
      gender: '',
      phone: '+256700000003',
      department: ''
    }
  ];
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // name
    { wch: 30 }, // email
    { wch: 10 }, // role
    { wch: 12 }, // organizationCode
    { wch: 12 }, // studentId
    { wch: 15 }, // faculty
    { wch: 20 }, // course
    { wch: 12 }, // yearOfStudy
    { wch: 10 }, // gender
    { wch: 15 }, // phone
    { wch: 20 }, // department
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
  
  if (format === 'xlsx') {
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=user_import_template.xlsx');
    res.send(buffer);
  } else {
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=user_import_template.csv');
    res.send(csvContent);
  }
});

module.exports = {
  validateBulkUpload,
  bulkImportUsers,
  downloadTemplate
};
