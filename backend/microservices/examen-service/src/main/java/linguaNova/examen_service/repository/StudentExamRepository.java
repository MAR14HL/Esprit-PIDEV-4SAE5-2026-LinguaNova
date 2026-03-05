package linguaNova.examen_service.repository;

import linguaNova.examen_service.entity.Exam;
import linguaNova.examen_service.entity.StudentExam;
import linguaNova.examen_service.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentExamRepository extends JpaRepository<StudentExam, Long> {
    List<StudentExam> findByStudentProfile(StudentProfile studentProfile);
    List<StudentExam> findByExam(Exam exam);
    List<StudentExam> findByStudentProfileId(Long studentProfileId);
    List<StudentExam> findByExamId(Long examId);
}