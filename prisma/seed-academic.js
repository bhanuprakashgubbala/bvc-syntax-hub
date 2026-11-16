const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertUser(data) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        ...(data.studentId ? [{ studentId: data.studentId }] : [])
      ]
    }
  });
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data
    });
  }
  return prisma.user.create({ data });
}

async function main() {
  console.log('Seeding BVCEC CSE Academic System...');

  // 1. Department
  const dept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
      college: 'Bonam Venkatachalam Engineering College, Odalaravu'
    }
  });

  // 2. Sections
  const secA = await prisma.section.upsert({
    where: { name_academicYear: { name: 'CSE-A', academicYear: '2025-2026' } },
    update: {},
    create: {
      name: 'CSE-A',
      departmentId: dept.id,
      academicYear: '2025-2026',
      semester: 'IV Semester (2-2)'
    }
  });

  const secB = await prisma.section.upsert({
    where: { name_academicYear: { name: 'CSE-B', academicYear: '2025-2026' } },
    update: {},
    create: {
      name: 'CSE-B',
      departmentId: dept.id,
      academicYear: '2025-2026',
      semester: 'IV Semester (2-2)'
    }
  });

  const secC = await prisma.section.upsert({
    where: { name_academicYear: { name: 'CSE-C', academicYear: '2025-2026' } },
    update: {},
    create: {
      name: 'CSE-C',
      departmentId: dept.id,
      academicYear: '2025-2026',
      semester: 'IV Semester (2-2)'
    }
  });

  // 3. Subjects
  const subJava = await prisma.subject.upsert({
    where: { code: 'CS201' },
    update: {},
    create: {
      code: 'CS201',
      name: 'Java Programming Lab',
      departmentId: dept.id
    }
  });

  const subPython = await prisma.subject.upsert({
    where: { code: 'CS202' },
    update: {},
    create: {
      code: 'CS202',
      name: 'Python & Data Structures Lab',
      departmentId: dept.id
    }
  });

  const subC = await prisma.subject.upsert({
    where: { code: 'CS203' },
    update: {},
    create: {
      code: 'CS203',
      name: 'C Programming & Algorithms Lab',
      departmentId: dept.id
    }
  });

  const subDBMS = await prisma.subject.upsert({
    where: { code: 'CS204' },
    update: {},
    create: {
      code: 'CS204',
      name: 'Database Management Systems Lab',
      departmentId: dept.id
    }
  });

  // 4. HOD User
  const hod = await upsertUser({
    email: 'hod.cse@bvcgroup.in',
    password: 'hod123',
    fullName: 'Dr. B S N Murthy',
    role: 'HOD',
    employeeId: 'HOD-CSE-001',
    organization: 'Bonam Venkatachalam Engineering College',
    college: 'BVCEC',
    department: 'Computer Science and Engineering'
  });

  // 5. Faculty Users
  const facJava = await upsertUser({
    email: 'faculty.java@bvcgroup.in',
    password: 'faculty123',
    fullName: 'Prof. S. R. Sharma',
    role: 'FACULTY',
    employeeId: 'FAC-CSE-101',
    organization: 'Bonam Venkatachalam Engineering College',
    college: 'BVCEC',
    department: 'Computer Science and Engineering'
  });

  const facPython = await upsertUser({
    email: 'faculty.python@bvcgroup.in',
    password: 'faculty123',
    fullName: 'Dr. P. V. Lakshmi',
    role: 'FACULTY',
    employeeId: 'FAC-CSE-102',
    organization: 'Bonam Venkatachalam Engineering College',
    college: 'BVCEC',
    department: 'Computer Science and Engineering'
  });

  const facC = await upsertUser({
    email: 'faculty.c@bvcgroup.in',
    password: 'faculty123',
    fullName: 'Prof. M. Venkatesh',
    role: 'FACULTY',
    employeeId: 'FAC-CSE-103',
    organization: 'Bonam Venkatachalam Engineering College',
    college: 'BVCEC',
    department: 'Computer Science and Engineering'
  });

  // 6. Student Users
  const student1 = await upsertUser({
    email: '25221A0501@bvcgroup.in',
    password: 'student123',
    fullName: 'A. Surya Teja',
    rollNumber: '25221A0501',
    studentId: '25221A0501',
    role: 'STUDENT',
    sectionId: secA.id,
    batchYear: '2029',
    organization: 'Bonam Venkatachalam Engineering College',
    college: 'BVCEC',
    department: 'Computer Science and Engineering'
  });

  const student2 = await upsertUser({
    email: '25221A0565@bvcgroup.in',
    password: 'student123',
    fullName: 'B. Sneha Reddy',
    rollNumber: '25221A0565',
    studentId: '25221A0565',
    role: 'STUDENT',
    sectionId: secB.id,
    batchYear: '2029',
    organization: 'Bonam Venkatachalam Engineering College',
    college: 'BVCEC',
    department: 'Computer Science and Engineering'
  });

  const student3 = await upsertUser({
    email: '25221A0546@bvcgroup.in',
    password: 'student123',
    fullName: 'K. Sai Kiran',
    rollNumber: '25221A0546',
    studentId: '25221A0546',
    role: 'STUDENT',
    sectionId: secA.id,
    batchYear: '2029',
    organization: 'Bonam Venkatachalam Engineering College',
    college: 'BVCEC',
    department: 'Computer Science and Engineering'
  });

  // 7. Faculty Allocations (Exact user example in Section 2)
  // Faculty A (Sharma) -> Java -> CSE-A
  await prisma.facultyAllocation.upsert({
    where: {
      facultyId_subjectId_sectionId_academicYear: {
        facultyId: facJava.id,
        subjectId: subJava.id,
        sectionId: secA.id,
        academicYear: '2025-2026'
      }
    },
    update: {},
    create: {
      facultyId: facJava.id,
      subjectId: subJava.id,
      sectionId: secA.id,
      academicYear: '2025-2026'
    }
  });

  // Faculty B (Lakshmi) -> Python -> CSE-A
  await prisma.facultyAllocation.upsert({
    where: {
      facultyId_subjectId_sectionId_academicYear: {
        facultyId: facPython.id,
        subjectId: subPython.id,
        sectionId: secA.id,
        academicYear: '2025-2026'
      }
    },
    update: {},
    create: {
      facultyId: facPython.id,
      subjectId: subPython.id,
      sectionId: secA.id,
      academicYear: '2025-2026'
    }
  });

  // Faculty A (Sharma) -> Java -> CSE-B
  await prisma.facultyAllocation.upsert({
    where: {
      facultyId_subjectId_sectionId_academicYear: {
        facultyId: facJava.id,
        subjectId: subJava.id,
        sectionId: secB.id,
        academicYear: '2025-2026'
      }
    },
    update: {},
    create: {
      facultyId: facJava.id,
      subjectId: subJava.id,
      sectionId: secB.id,
      academicYear: '2025-2026'
    }
  });

  // Faculty B (Lakshmi) -> Python -> CSE-B
  await prisma.facultyAllocation.upsert({
    where: {
      facultyId_subjectId_sectionId_academicYear: {
        facultyId: facPython.id,
        subjectId: subPython.id,
        sectionId: secB.id,
        academicYear: '2025-2026'
      }
    },
    update: {},
    create: {
      facultyId: facPython.id,
      subjectId: subPython.id,
      sectionId: secB.id,
      academicYear: '2025-2026'
    }
  });

  // Faculty C (Venkatesh) -> C Programming -> CSE-A
  await prisma.facultyAllocation.upsert({
    where: {
      facultyId_subjectId_sectionId_academicYear: {
        facultyId: facC.id,
        subjectId: subC.id,
        sectionId: secA.id,
        academicYear: '2025-2026'
      }
    },
    update: {},
    create: {
      facultyId: facC.id,
      subjectId: subC.id,
      sectionId: secA.id,
      academicYear: '2025-2026'
    }
  });

  // 8. Sample Lab Tasks
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const tenDaysLater = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  // Active Task 1 (Java, CSE-A)
  await prisma.task.upsert({
    where: { id: 'task-java-exp-01' },
    update: {},
    create: {
      id: 'task-java-exp-01',
      title: 'Matrix Multiplication using 2D Arrays',
      experimentNumber: '01',
      description: 'Write a Java program to multiply two matrices of dimensions R1xC1 and R2xC2.',
      aim: 'To write, compile and execute a Java program for performing matrix multiplication of two matrices after validating dimensional compatibility.',
      instructions: '1. Read dimensions and elements of matrix A and matrix B.\n2. Verify if columns of A equals rows of B.\n3. Compute product and display output row by row.',
      language: 'java',
      starterCode: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Matrix Multiplication Solution
        int[][] A = {{1, 2}, {3, 4}};
        int[][] B = {{5, 6}, {7, 8}};
        int[][] C = new int[2][2];

        for (int i = 0; i < 2; i++) {
            for (int j = 0; j < 2; j++) {
                for (int k = 0; k < 2; k++) {
                    C[i][j] += A[i][k] * B[k][j];
                }
                System.out.print(C[i][j] + (j == 1 ? "" : " "));
            }
            System.out.println();
        }
    }
}`,
      maxMarks: 20,
      openTime: twoDaysAgo,
      closeTime: sevenDaysLater,
      facultyId: facJava.id,
      subjectId: subJava.id,
      sectionId: secA.id,
    }
  });

  // Active Task 2 (Python, CSE-A)
  await prisma.task.upsert({
    where: { id: 'task-python-exp-02' },
    update: {},
    create: {
      id: 'task-python-exp-02',
      title: 'Binary Search Algorithm Implementation',
      experimentNumber: '02',
      description: 'Implement Binary Search on a sorted list to locate an element.',
      aim: 'To design, develop and test a Python program that implements Binary Search on an array of integers.',
      instructions: 'Input a sorted list and target key. Print index or -1 if not found.',
      language: 'python',
      starterCode: `def binary_search(arr, key):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == key:
            return mid
        elif arr[mid] < key:
            low = mid + 1
        else:
            high = mid - 1
    return -1

# Sample test:
arr = [10, 20, 30, 40, 50, 60]
key = 40
print(f"Key {key} found at index: {binary_search(arr, key)}")`,
      maxMarks: 20,
      openTime: twoDaysAgo,
      closeTime: sevenDaysLater,
      facultyId: facPython.id,
      subjectId: subPython.id,
      sectionId: secA.id,
    }
  });

  // Upcoming Task 3 (Java, CSE-A)
  await prisma.task.upsert({
    where: { id: 'task-java-exp-03' },
    update: {},
    create: {
      id: 'task-java-exp-03',
      title: 'Singly Linked List Insertion & Deletion',
      experimentNumber: '03',
      description: 'Implement Singly Linked List operations in Java.',
      aim: 'To implement a singly linked list data structure with insertAtHead, insertAtTail and delete operations.',
      instructions: 'Follow standard node reference pointers.',
      language: 'java',
      maxMarks: 20,
      openTime: threeDaysLater,
      closeTime: tenDaysLater,
      facultyId: facJava.id,
      subjectId: subJava.id,
      sectionId: secA.id,
    }
  });

  // Closed Task 4 (Java, CSE-A)
  await prisma.task.upsert({
    where: { id: 'task-java-exp-00' },
    update: {},
    create: {
      id: 'task-java-exp-00',
      title: 'Java Development Kit Environment Setup & Basic I/O',
      experimentNumber: '00',
      description: 'Familiarization with Java tools and basic console programs.',
      aim: 'To verify Java compiler setup and execute basic program constructs.',
      language: 'java',
      maxMarks: 10,
      openTime: tenDaysAgo,
      closeTime: yesterday,
      facultyId: facJava.id,
      subjectId: subJava.id,
      sectionId: secA.id,
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
