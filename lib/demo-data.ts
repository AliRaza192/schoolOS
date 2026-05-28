export const DEMO_SCHOOL = {
  name: "Al-Falah Grammar School (Demo)",
  city: "Karachi",
  phone: "03001234567",
  address: "Block 5, Gulshan-e-Iqbal, Karachi",
  email: "demo@alfalah.edu.pk",
  plan: "pro" as const,
};

export const DEMO_CLASSES = [
  { name: "Class 1", section: "A", academicYear: "2024-2025" },
  { name: "Class 5", section: "A", academicYear: "2024-2025" },
  { name: "Class 8", section: "B", academicYear: "2024-2025" },
];

export const DEMO_STUDENTS_PER_CLASS = [
  // Class 1
  [
    { name: "Ahmad Ali", fatherName: "Muhammad Ali", rollNo: "01" },
    { name: "Fatima Khan", fatherName: "Khan Bahadur", rollNo: "02" },
    { name: "Usman Sheikh", fatherName: "Sheikh Nadeem", rollNo: "03" },
    { name: "Sara Malik", fatherName: "Malik Akbar", rollNo: "04" },
    { name: "Hassan Raza", fatherName: "Raza Sahib", rollNo: "05" },
    { name: "Aisha Butt", fatherName: "Butt Sahib", rollNo: "06" },
    { name: "Hamza Qureshi", fatherName: "Qureshi Sahib", rollNo: "07" },
    { name: "Zara Siddiqui", fatherName: "Siddiqui Sahib", rollNo: "08" },
    { name: "Daniyal Mirza", fatherName: "Mirza Sahib", rollNo: "09" },
    { name: "Hina Akhtar", fatherName: "Akhtar Sahib", rollNo: "10" },
  ],
  // Class 5
  [
    { name: "Bilal Ahmed", fatherName: "Ahmed Sahib", rollNo: "01" },
    { name: "Ayesha Siddiqui", fatherName: "Siddiqui Sahib", rollNo: "02" },
    { name: "Omar Farooq", fatherName: "Farooq Sahib", rollNo: "03" },
    { name: "Zainab Hussain", fatherName: "Hussain Sahib", rollNo: "04" },
    { name: "Ali Haider", fatherName: "Haider Sahib", rollNo: "05" },
    { name: "Mariam Baig", fatherName: "Baig Sahib", rollNo: "06" },
    { name: "Tariq Mehmood", fatherName: "Mehmood Sahib", rollNo: "07" },
    { name: "Sana Iqbal", fatherName: "Iqbal Sahib", rollNo: "08" },
    { name: "Kamran Abbas", fatherName: "Abbas Sahib", rollNo: "09" },
    { name: "Nadia Sheikh", fatherName: "Sheikh Sahib", rollNo: "10" },
  ],
  // Class 8
  [
    { name: "Asad Jamil", fatherName: "Jamil Sahib", rollNo: "01" },
    { name: "Rabia Noor", fatherName: "Noor Sahib", rollNo: "02" },
    { name: "Faisal Rehman", fatherName: "Rehman Sahib", rollNo: "03" },
    { name: "Mahnoor Arif", fatherName: "Arif Sahib", rollNo: "04" },
    { name: "Shahzaib Khan", fatherName: "Khan Sahib", rollNo: "05" },
    { name: "Iqra Saleem", fatherName: "Saleem Sahib", rollNo: "06" },
    { name: "Nabeel Chaudhry", fatherName: "Chaudhry Sahib", rollNo: "07" },
    { name: "Saima Perveen", fatherName: "Perveen Sahib", rollNo: "08" },
    { name: "Rehan Malik", fatherName: "Malik Sahib", rollNo: "09" },
    { name: "Amna Zahid", fatherName: "Zahid Sahib", rollNo: "10" },
  ],
];

export const DEMO_SUBJECTS = [
  "Mathematics",
  "English",
  "Urdu",
  "Science",
  "Islamiat",
  "Social Studies",
];

export const DEMO_FEE_AMOUNT = 1500;