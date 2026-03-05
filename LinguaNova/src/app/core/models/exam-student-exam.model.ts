import type { ExamStudentProfile } from './exam-student-profile.model';
import type { Exam } from './exam.model';
import type { StudentAnswer } from './exam-student-answer.model';

export interface StudentExam {
  id?: number;
  score?: number;
  submittedAt?: string;
  validated?: boolean;
  studentProfile?: ExamStudentProfile;
  exam?: Exam;
  answers?: StudentAnswer[];
}
