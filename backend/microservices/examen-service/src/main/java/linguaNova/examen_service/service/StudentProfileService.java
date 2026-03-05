package linguaNova.examen_service.service;

import linguaNova.examen_service.client.UserClient;
import linguaNova.examen_service.dto.UserResponse;
import linguaNova.examen_service.entity.StudentProfile;
import linguaNova.examen_service.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserClient userClient;

    public StudentProfileService(StudentProfileRepository studentProfileRepository, UserClient userClient) {
        this.studentProfileRepository = studentProfileRepository;
        this.userClient = userClient;
    }

    // Créer un profil étudiant
    public StudentProfile createStudentProfile(StudentProfile studentProfile) {
        // Vérifier que le userId correspond bien à un STUDENT dans le user-service
        if (studentProfile.getUserId() != null) {
            try {
                UserResponse user = userClient.getUserById(studentProfile.getUserId());
                if (user == null || !"STUDENT".equalsIgnoreCase(user.getRole())) {
                    throw new RuntimeException("L'utilisateur avec l'ID " + studentProfile.getUserId() + " n'est pas un étudiant");
                }
                // Synchroniser les données depuis le user-service si non fournies
                if (studentProfile.getFirstName() == null && user.getUsername() != null) {
                    studentProfile.setFirstName(user.getUsername());
                }
                if (studentProfile.getLastName() == null) {
                    studentProfile.setLastName("");
                }
            } catch (RuntimeException e) {
                throw e;
            } catch (Exception e) {
                // user-service indisponible, on continue
            }
        }
        return studentProfileRepository.save(studentProfile);
    }

    // Récupérer tous les profils étudiants
    public List<StudentProfile> getAllStudentProfiles() {
        return studentProfileRepository.findAll();
    }

    // Récupérer un profil étudiant par ID
    public StudentProfile getStudentProfileById(Long id) {
        return studentProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profil étudiant non trouvé avec l'ID: " + id));
    }

    /**
     * Récupérer le profil étudiant par userId (clé du user-service).
     */
    public Optional<StudentProfile> getStudentProfileByUserId(Long userId) {
        return studentProfileRepository.findByUserId(userId);
    }

    /**
     * Récupérer les infos utilisateur enrichies depuis le user-service.
     */
    public UserResponse getUserInfoByStudentProfileId(Long profileId) {
        StudentProfile profile = getStudentProfileById(profileId);
        if (profile.getUserId() == null) {
            throw new RuntimeException("Ce profil étudiant n'est pas lié à un utilisateur");
        }
        return userClient.getUserById(profile.getUserId());
    }

    // Mettre à jour un profil étudiant
    public StudentProfile updateStudentProfile(Long id, StudentProfile studentProfileDetails) {
        StudentProfile studentProfile = getStudentProfileById(id);

        if (studentProfileDetails.getLastName() != null) {
            studentProfile.setLastName(studentProfileDetails.getLastName());
        }
        if (studentProfileDetails.getFirstName() != null) {
            studentProfile.setFirstName(studentProfileDetails.getFirstName());
        }
        if (studentProfileDetails.getPhone() != null) {
            studentProfile.setPhone(studentProfileDetails.getPhone());
        }
        if (studentProfileDetails.getBirthDate() != null) {
            studentProfile.setBirthDate(studentProfileDetails.getBirthDate());
        }
        if (studentProfileDetails.getUserId() != null) {
            studentProfile.setUserId(studentProfileDetails.getUserId());
        }

        return studentProfileRepository.save(studentProfile);
    }

    // Supprimer un profil étudiant
    public void deleteStudentProfile(Long id) {
        if (!studentProfileRepository.existsById(id)) {
            throw new RuntimeException("Profil étudiant non trouvé avec l'ID: " + id);
        }
        studentProfileRepository.deleteById(id);
    }
}
