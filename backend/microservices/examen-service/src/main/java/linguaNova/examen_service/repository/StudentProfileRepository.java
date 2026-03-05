package linguaNova.examen_service.repository;

import linguaNova.examen_service.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    // Recherche par userId (référence au user-service)
    Optional<StudentProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
