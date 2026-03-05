export interface ExamStudentProfile {
  id?: number;
  lastName: string;
  firstName: string;
  phone: string;
  birthDate: string;
  studentExams?: unknown[];
}
