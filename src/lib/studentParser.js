/**
 * Student Registration & Roll Number Parser for Bonam Venkatachalam Engineering College (BVCEC)
 * Implements JNTUK / Autonomous Registration Number Identification Rules:
 * Example Register Number: 25221A0556 (10 characters, including one alphabet)
 *
 * Identification Rules:
 * 1. Admission Academic Year:
 *    - First two digits indicate the year of admission (e.g., '25' -> 2025).
 * 2. Academic Year Identification:
 *    - Calculate the student's current academic year using their admission year and the current academic year.
 *    - Example: A student admitted in 2025 will be identified as a second-year student during the 2026–27 academic year.
 *    - Calculated dynamically from current date — not hardcoded!
 * 3. Branch Identification:
 *    - The 8th character (0-indexed index 7) indicates the branch code:
 *      5 = Computer Science and Engineering (CSE)
 *      4 = Electronics and Communication Engineering (ECE)
 *    - Configurable mapping for additional branches (EEE, MECH, CIVIL, AIML, DS).
 * 4. Remaining Register Number Characters:
 *    - Preserved as part of the unique student registration number without assumptions.
 */

// Configurable Branch Identification Map
export const BRANCH_CODES = {
  '5': {
    code: '5',
    fullCode: '05',
    name: 'Computer Science and Engineering',
    short: 'CSE',
    department: 'Computer Science and Engineering',
  },
  '4': {
    code: '4',
    fullCode: '04',
    name: 'Electronics and Communication Engineering',
    short: 'ECE',
    department: 'Electronics and Communication Engineering',
  },
  '3': {
    code: '3',
    fullCode: '03',
    name: 'Electrical and Electronics Engineering',
    short: 'EEE',
    department: 'Electrical and Electronics Engineering',
  },
  '2': {
    code: '2',
    fullCode: '02',
    name: 'Mechanical Engineering',
    short: 'MECH',
    department: 'Mechanical Engineering',
  },
  '1': {
    code: '1',
    fullCode: '01',
    name: 'Civil Engineering',
    short: 'CIVIL',
    department: 'Civil Engineering',
  },
  'A': {
    code: 'A',
    fullCode: '42',
    name: 'Artificial Intelligence & Machine Learning',
    short: 'CSE-AIML',
    department: 'Computer Science and Engineering',
  },
  'D': {
    code: 'D',
    fullCode: '44',
    name: 'Data Science',
    short: 'CSE-DS',
    department: 'Computer Science and Engineering',
  },
};

/**
 * Dynamically calculate academic year and year of study
 * Indian Engineering academic year runs July/August to May/June.
 *
 * @param {number} admissionYear - e.g. 2025
 * @param {Date} [referenceDate] - defaults to new Date()
 */
export function calculateAcademicYear(admissionYear, referenceDate = new Date()) {
  const currentCalendarYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0 = Jan, 5 = June, 11 = Dec

  // Academic year start:
  // If month is June or later (>= 5), the academic year started in currentCalendarYear (e.g. June 2026 -> 2026-27).
  // If month is Jan to May (< 5), the academic year started in previous year (e.g. Feb 2027 -> 2026-27).
  const currentAcademicYearStart = currentMonth >= 5 ? currentCalendarYear : currentCalendarYear - 1;
  const currentAcademicYearEnd = currentAcademicYearStart + 1;
  const academicYearRange = `${currentAcademicYearStart}–${String(currentAcademicYearEnd).slice(-2)}`;
  const academicYearFull = `${currentAcademicYearStart}–${currentAcademicYearEnd}`;

  // Difference in years:
  // Admitted in 2025, in academic year 2026-27: (2026 - 2025) + 1 = 2 (Second Year)
  // Admitted in 2025, in academic year 2025-26: (2025 - 2025) + 1 = 1 (First Year)
  // Admitted in 2025, in academic year 2027-28: (2027 - 2025) + 1 = 3 (Third Year)
  // Admitted in 2025, in academic year 2028-29: (2028 - 2025) + 1 = 4 (Fourth Year)
  const diff = (currentAcademicYearStart - admissionYear) + 1;

  let yearOfStudy = '';
  let romanYear = '';
  let semester = '';

  if (diff === 1) {
    yearOfStudy = '1st Year (First Year)';
    romanYear = 'I Year';
    semester = currentMonth >= 5 && currentMonth <= 11 ? 'Semester I (1-1)' : 'Semester II (1-2)';
  } else if (diff === 2) {
    yearOfStudy = '2nd Year (Second Year)';
    romanYear = 'II Year';
    semester = currentMonth >= 5 && currentMonth <= 11 ? 'Semester III (2-1)' : 'Semester IV (2-2)';
  } else if (diff === 3) {
    yearOfStudy = '3rd Year (Third Year)';
    romanYear = 'III Year';
    semester = currentMonth >= 5 && currentMonth <= 11 ? 'Semester V (3-1)' : 'Semester VI (3-2)';
  } else if (diff === 4) {
    yearOfStudy = '4th Year (Fourth Year)';
    romanYear = 'IV Year';
    semester = currentMonth >= 5 && currentMonth <= 11 ? 'Semester VII (4-1)' : 'Semester VIII (4-2)';
  } else if (diff > 4) {
    yearOfStudy = 'Graduated / Alumni';
    romanYear = 'Alumni';
    semester = 'Course Completed';
  } else {
    yearOfStudy = 'Newly Admitted';
    romanYear = 'Pre-Term';
    semester = 'Pre-Term';
  }

  return {
    admissionYear,
    currentAcademicYearStart,
    currentAcademicYearEnd,
    academicYearRange,
    academicYearFull,
    yearOfStudy,
    romanYear,
    semester,
    numericYear: diff
  };
}

/**
 * Validates and parses student register number
 * Example: '25221A0556'
 */
export function parseStudentRegisterNumber(input, referenceDate = new Date()) {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Please enter your 10-character Register Number (e.g. 25221A0556).'
    };
  }

  const clean = input.trim().toUpperCase();

  // 1. Length check: exactly 10 characters
  if (clean.length !== 10) {
    return {
      isValid: false,
      error: `Register number must be exactly 10 characters (currently ${clean.length} characters).`
    };
  }

  // 2. Format validation: JNTUK / Autonomous pattern (e.g. 25221A0556)
  // 2 digits (admission year) + 3 alphanumeric (college code) + 1 alphabet (degree) + 4 alphanumeric
  const standardPattern = /^[0-9]{2}[0-9A-Z]{3}[A-Z][0-9A-Z]{4}$/i;
  if (!standardPattern.test(clean)) {
    return {
      isValid: false,
      error: 'Invalid register number format. Expected format: 10 characters with admission year and degree code (e.g. 25221A0556).'
    };
  }

  // 3. Admission Academic Year (first two digits)
  const yearPrefix = parseInt(clean.slice(0, 2), 10);
  if (isNaN(yearPrefix)) {
    return {
      isValid: false,
      error: 'First two characters of the register number must be numeric admission year (e.g. 25 for 2025).'
    };
  }
  const admissionYear = 2000 + yearPrefix;

  // 4. Academic Year Identification
  const academicDetails = calculateAcademicYear(admissionYear, referenceDate);

  // 5. Branch Identification (8th character, 0-indexed index 7)
  const branchChar = clean.charAt(7);
  const branchInfo = BRANCH_CODES[branchChar];

  if (!branchInfo) {
    return {
      isValid: false,
      error: `Branch code '${branchChar}' (8th character) is not recognized. Recognized codes: 5=CSE, 4=ECE, 3=EEE, 2=MECH, 1=CIVIL, A=CSE-AIML, D=CSE-DS.`
    };
  }

  // 6. Remaining Register Number Characters
  const collegeCode = clean.slice(2, 5); // '221'
  const degreeChar = clean.charAt(5); // 'A'
  const rollSequence = clean.slice(8); // '56'

  return {
    isValid: true,
    registerNumber: clean,
    rollNumber: clean,
    admissionYear,
    currentAcademicYear: academicDetails.academicYearRange,
    academicYearFull: academicDetails.academicYearFull,
    yearOfStudy: academicDetails.yearOfStudy,
    romanYear: academicDetails.romanYear,
    numericYear: academicDetails.numericYear,
    semester: academicDetails.semester,
    branchCode: branchChar,
    branchName: branchInfo.name,
    branchShort: branchInfo.short,
    department: branchInfo.department,
    collegeCode,
    collegeName: 'Bonam Venkatachalam Engineering College (Autonomous), Odalarevu',
    collegeShort: 'BVCEC',
    organization: 'Bonam Venkatachalam Engineering College',
    degree: degreeChar === 'A' ? 'B.Tech (Bachelor of Technology)' : 'Undergraduate Engineering',
    batchPassingYear: String(admissionYear + 4),
    rawInput: input
  };
}

/**
 * Backward compatibility parser for existing imports
 */
export function parseRegistrationNumber(input) {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      rollNumber: '',
      fullName: 'Student',
      studentId: 'BVC-2029',
      branchName: 'Computer Science & Engineering',
      branchShort: 'CSE',
      department: 'Computer Science & Engineering',
      batchYear: '2029',
      joiningYear: '2025',
      organization: 'Bonam Venkatachalam Engineering College',
      college: 'BVCEC',
    };
  }

  const clean = input.trim().toLowerCase();
  const rawUsername = clean.includes('@') ? clean.split('@')[0] : clean;
  const roll = rawUsername.toUpperCase();

  const parsed = parseStudentRegisterNumber(roll);
  if (parsed.isValid) {
    return {
      isValid: true,
      rollNumber: parsed.registerNumber,
      fullName: parsed.registerNumber,
      studentId: parsed.registerNumber,
      branchName: parsed.branchName,
      branchShort: parsed.branchShort,
      department: parsed.department,
      batchYear: parsed.batchPassingYear,
      joiningYear: String(parsed.admissionYear),
      currentAcademicYear: parsed.currentAcademicYear,
      yearOfStudy: parsed.yearOfStudy,
      organization: parsed.organization,
      college: parsed.collegeShort,
    };
  }

  // Fallback for custom username
  const formattedName = rawUsername
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return {
    isValid: false,
    rollNumber: roll,
    fullName: formattedName || 'Student',
    studentId: roll,
    branchName: 'Computer Science & Engineering',
    branchShort: 'CSE',
    department: 'Computer Science & Engineering',
    batchYear: '2029',
    joiningYear: '2025',
    currentAcademicYear: '2026–27',
    yearOfStudy: '2nd Year (Second Year)',
    organization: 'Bonam Venkatachalam Engineering College',
    college: 'BVCEC',
  };
}
