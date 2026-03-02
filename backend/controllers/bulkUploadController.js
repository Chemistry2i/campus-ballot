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
 * MINIMUM REQUIRED FOR STUDENTS: email, studentId, organization (or organizationCode)
 * Optional: name (derived from email if missing), faculty, course, yearOfStudy, gender, phone, password
 * For other roles: name, email, role required
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
// For students: MINIMUM required = email, studentId, organization
// For other roles: name, email required
const validateUserRow = (row, rowIndex, adminOrganization = null) => {
  const errors = [];
  const role = (row.role || 'student').toLowerCase().trim();
  
  // Email is always required
  if (!row.email || !row.email.trim()) {
    errors.push(`Row ${rowIndex}: Email is required`);
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) {
    errors.push(`Row ${rowIndex}: Invalid email format (${row.email})`);
  }
  
  const validRoles = ['student', 'admin', 'observer', 'candidate', 'agent'];
  if (!validRoles.includes(role)) {
    errors.push(`Row ${rowIndex}: Invalid role '${row.role}'. Valid roles: ${validRoles.join(', ')}`);
  }
  
  // Student-specific validation - MINIMUM: email, studentId, organization
  if (role === 'student') {
    if (!row.studentId || !row.studentId.toString().trim()) {
      errors.push(`Row ${rowIndex}: Student ID is required for students`);
    }
    // Organization is required for imports (can be code or name)
    if (!row.organizationCode && !adminOrganization) {
      errors.push(`Row ${rowIndex}: Organization is required for students (provide 'organization' column or import as assigned admin)`);
    }
    // Name is optional - will be derived from email if not provided
    // Faculty, course, yearOfStudy, gender are all optional
  } else {
    // Non-student roles still require name
    if (!row.name || !row.name.trim()) {
      errors.push(`Row ${rowIndex}: Name is required`);
    }
  }
  
  // Validate gender format if provided
  if (row.gender) {
    const validGenders = ['male', 'female', 'other', 'm', 'f', 'o'];
    const gender = row.gender.trim().toLowerCase();
    if (!validGenders.includes(gender)) {
      errors.push(`Row ${rowIndex}: Invalid gender '${row.gender}'. Use Male/Female/Other`);
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
      const rowErrors = validateUserRow(row, rowIndex, req.user?.organization);
      
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
  
  console.log('[BULK IMPORT] Starting import with options:', {
    skipDuplicates,
    sendWelcomeEmail,
    defaultOrganizationId,
    adminOrg: req.user.organization,
    bodyOrg: req.body.organization
  });
  
  try {
    const rows = parseFile(req.file.buffer, req.file.originalname);
    
    console.log(`[BULK IMPORT] Parsed ${rows.length} rows from file`);
    if (rows.length > 0) {
      console.log('[BULK IMPORT] First row sample:', JSON.stringify(rows[0], null, 2));
    }
    
    if (rows.length === 0) {
      res.status(400);
      throw new Error('File is empty or has no data rows');
    }
    
    // Build organization lookup map (by code AND by name for flexibility)
    const orgValues = [...new Set(rows.map(r => r.organizationCode?.trim()).filter(Boolean))];
    const organizationMap = {}; // code -> ID
    const organizationNameMap = {}; // lowercase name -> ID
    
    // Fetch ALL active organizations for flexible matching
    const allOrgs = await Organization.find({ status: 'active' }).select('_id name code');
    allOrgs.forEach(org => {
      organizationMap[org.code.toUpperCase()] = org._id;
      organizationNameMap[org.name.toLowerCase()] = org._id;
    });
    
    console.log('[BULK IMPORT] Available organizations:', allOrgs.map(o => `${o.name} (${o.code})`).join(', '));
    
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
        // Validate row (pass admin's organization for fallback)
        const rowErrors = validateUserRow(row, rowIndex, defaultOrganizationId);
        
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
        
        // Determine organization for this user - try code first, then name
        let userOrganization = defaultOrganizationId;
        if (row.organizationCode) {
          const orgValue = row.organizationCode.trim();
          const orgCodeUpper = orgValue.toUpperCase();
          const orgNameLower = orgValue.toLowerCase();
          
          // Try matching by code first, then by name
          if (organizationMap[orgCodeUpper]) {
            userOrganization = organizationMap[orgCodeUpper];
          } else if (organizationNameMap[orgNameLower]) {
            userOrganization = organizationNameMap[orgNameLower];
          } else {
            results.failed++;
            results.errors.push(`Row ${rowIndex}: Organization '${orgValue}' not found. Available: ${allOrgs.map(o => o.code).join(', ')}`);
            continue;
          }
        }
        
        // If still no organization, fail with helpful message
        if (!userOrganization) {
          results.failed++;
          results.errors.push(`Row ${rowIndex}: No organization specified and admin has no default organization. Add 'organization' column to CSV.`);
          continue;
        }
        
        // Derive name from email if not provided
        let userName = row.name?.trim();
        if (!userName && email) {
          // Extract name from email (e.g., john.doe@uni.edu -> John Doe)
          const localPart = email.split('@')[0];
          userName = localPart
            .replace(/[._-]/g, ' ') // Replace separators with spaces
            .replace(/\d+/g, '')   // Remove numbers
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ') || 'Student';
        }
        
        // Create user object
        const userData = {
          name: userName,
          email: email,
          password: hashedPassword,
          role: role,
          organization: userOrganization,
          isVerified: true, // Auto-verify imported users
          emailVerified: true,
          accountStatus: 'active'
        };
        
        // Add student-specific fields (all optional except studentId)
        if (role === 'student') {
          userData.studentId = studentId;
          if (row.faculty?.trim()) userData.faculty = row.faculty.trim();
          if (row.course?.trim()) userData.course = row.course.trim();
          if (row.yearOfStudy?.toString().trim()) userData.yearOfStudy = row.yearOfStudy.toString().trim();
          if (row.gender) userData.gender = normalizeGender(row.gender);
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
      action: 'import',
      entityType: 'User',
      details: `Bulk imported ${results.imported} users from file ${req.file.originalname} (${results.skipped} skipped, ${results.failed} failed)`,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
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
  
  // Sample data showing MINIMUM requirements: email, studentId, organization
  // Other fields are OPTIONAL and will be auto-derived if missing
  const sampleData = [
    {
      email: 'john.doe@university.edu',
      studentId: 'STU001',
      organization: 'KYU',
      name: 'John Doe (optional)',
      faculty: 'Engineering (optional)',
      course: 'Computer Science (optional)',
      yearOfStudy: '3 (optional)',
      gender: 'Male (optional)',
      phone: '+256700000001 (optional)',
      role: 'student (default if blank)'
    },
    {
      email: 'jane.smith@university.edu',
      studentId: 'STU002',
      organization: 'KYU',
      name: '',
      faculty: 'Science',
      course: 'Biology',
      yearOfStudy: '2',
      gender: 'Female',
      phone: '',
      role: 'student'
    },
    {
      email: 'simple@university.edu',
      studentId: '22/U/12345',
      organization: 'KYU',
      name: '',
      faculty: '',
      course: '',
      yearOfStudy: '',
      gender: '',
      phone: '',
      role: ''
    }
  ];
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // email (REQUIRED)
    { wch: 15 }, // studentId (REQUIRED)
    { wch: 12 }, // organization (REQUIRED)
    { wch: 25 }, // name (optional)
    { wch: 20 }, // faculty (optional)
    { wch: 25 }, // course (optional)
    { wch: 15 }, // yearOfStudy (optional)
    { wch: 12 }, // gender (optional)
    { wch: 15 }, // phone (optional)
    { wch: 10 }, // role (optional, defaults to student)
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
