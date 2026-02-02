/**
 * Academic Structure Utility
 * Maps courses to their respective departments at Kyambogo University
 */

// Mapping: Course → Department
export const courseToDepartment = {
  // Computing and Information Science
  "Information Systems": "Department of Computer Science",
  "Information Technology and Computing": "Department of Computer Science",
  "Library and Information Science": "Department of Library and Information Science",
  
  // Engineering
  "Electrical Engineering": "Electrical Engineering",
  "Mechanical and Manufacturing Engineering": "Mechanical and Manufacturing Engineering",
  "Oil and Gas Production": "Oil and Gas Engineering",
  "Chemical and Process Engineering": "Chemical and Process Engineering",
  "Building and Civil Engineering": "Civil Engineering",
  "Telecommunication Engineering": "Telecommunication Engineering",
  "Environmental Engineering and Management": "Environmental Engineering",
  "Automotive and Power Engineering": "Automotive and Power Engineering",
  "Industrial Engineering and Management": "Industrial Engineering",
  "Mechatronics and Biomedical Engineering": "Mechatronics and Biomedical Engineering",
  "Water Engineering": "Water Engineering",
  "Refrigeration and Air Conditioning": "Refrigeration and Air Conditioning",
  "Biomedical Engineering": "Biomedical Engineering",
  "Computer Engineering": "Computer Engineering",
  
  // Science
  "Leather Tanning Technology": "Leather Technology",
  "Science Technology - Physics": "Physics",
  "Science Technology - Chemistry": "Chemistry",
  "Science Technology - Biology": "Biology",
  "Food Science and Processing Technology": "Food Science and Technology",
  "Textile and Clothing Technology": "Textile and Clothing Technology",
  "Statistics": "Statistics",
  "Material and Ceramic Science Technology": "Material and Ceramic Science",
  "Sports and Leisure Management": "Sports and Leisure Studies",
  "Environmental Science Technology and Management": "Environmental Science",
  "Education (Biological Sciences)": "Science Education",
  "Education (Economics)": "Economics Education",
  "Education (Physical Sciences)": "Science Education",
  "Sports and Exercise Instruction": "Sports Science",
  "Food Processing Technology": "Food Science and Technology",
  
  // Management & Entrepreneurship
  "Business Studies with Education": "Business Education",
  "Business Administration": "Business Administration",
  " Science in Accounting and Finance": "Accounting and Finance",
  "Administrative Science": "Administrative Science",
  "Procurement and Logistics Management": "Procurement and Logistics",
  "Management Science": "Management Science",
  "Banking and Microfinance": "Banking and Finance",
  
  // Arts and Humanities
  "Arts in Humanitites ": "Humanities",
  "Arts with Education": "Arts Education",
  "Performing Arts ": "Performing Arts",
  "Cultural Heritage Studies": "Cultural Heritage",
  "Archeology and Heritage Management": "Archeology and Heritage",
  "Ethics and Human Rights": "Ethics and Human Rights",
  
  // Social Sciences
  "Guidance and Counselling": "Guidance and Counselling",
  "Arts in Economics ": "Economics",
  "Demography & Reproductive Health": "Demography and Population Studies",
  "Development Studies": "Development Studies",
  "Public Administration and Resource Governance": "Public Administration",
  "Arts in Social Sciences": "Social Sciences",
  "Social Work and Social Administration": "Social Work",
  "Art in Security and Diplomatic Studies": "Security and Diplomatic Studies",
  "Economics and Statistics": "Economics",
  
  // Built Environment
  "Architecture": "Department of Architecture",
  "Surveying and Land Information Systems": "Department of Quantity Surveying and Property Valuation",
  "Science in Building Economics": "Building Economics",
  "Science in Land Economics": "Land Economics",
  
  // Agriculture
  "Vocational Studies in Agriculture with Education": "Agriculture Education",
  
  // Art and Industrial Design
  "Art and Industrial Design": "Art and Industrial Design",
  "Interior and Landscape Design ": "Interior and Landscape Design",
  "Textile and Apparel Design": "Textile and Apparel Design",
  "Computer and Graphic Design": "Computer and Graphic Design",
  "Art and Design with Education": "Art and Design Education",
  "Fine Art": "Fine Art",
  "Interior Design": "Interior Design",
  "Textiles Design and Surface Design": "Textiles Design",
  
  // Education
  "Pre-Primary Education": "Pre-Primary Education",
  
  // Special Needs & Rehabilitation
  "Adult and Community Education": "Adult and Community Education",
  "Community Development and Social Justice": "Community Development",
  "Community Based Rehabilitation": "Rehabilitation",
  "Sign Language Interpreting": "Sign Language Studies",
  "Mobility and Rehabilitation": "Rehabilitation",
  
  // Vocational Studies
  "Vocational Studies in Home Economics with Education": "Department of Family Life and Consumer Studies",
  "Science in Human Nutrition and Dietetics": "Department of Nutritional Science and Dietetics",
  "Hotel and Institutional Catering": "Department of Hotel and Institutional Catering",
  "Fashion and Cosmetology": "Department of Cosmetology and Fashion",
  "Fashion and Apparel Design": "Department of Cosmetology and Fashion"
};

/**
 * Get department name from course name
 * @param {string} courseName - The course name
 * @returns {string|null} - The department name or null if not found
 */
export const getDepartmentFromCourse = (courseName) => {
  if (!courseName) return null;
  return courseToDepartment[courseName] || null;
};

/**
 * Get all unique departments for a given faculty
 * @param {string} faculty - The faculty name
 * @param {object} facultyCourses - The faculty-courses mapping object
 * @returns {Array<string>} - Array of unique department names
 */
export const getDepartmentsByFaculty = (faculty, facultyCourses) => {
  if (!faculty || !facultyCourses || !facultyCourses[faculty]) {
    return [];
  }
  
  const courses = facultyCourses[faculty];
  const departments = courses
    .map(course => courseToDepartment[course])
    .filter(dept => dept !== null && dept !== undefined);
  
  // Return unique departments
  return [...new Set(departments)];
};

/**
 * Check if a course exists in the mapping
 * @param {string} courseName - The course name
 * @returns {boolean} - True if course exists in mapping
 */
export const isCourseValid = (courseName) => {
  return courseName in courseToDepartment;
};

/**
 * Get all available departments across all faculties
 * @returns {Array<string>} - Array of all unique department names
 */
export const getAllDepartments = () => {
  return [...new Set(Object.values(courseToDepartment))].sort();
};

export default {
  courseToDepartment,
  getDepartmentFromCourse,
  getDepartmentsByFaculty,
  isCourseValid,
  getAllDepartments
};
