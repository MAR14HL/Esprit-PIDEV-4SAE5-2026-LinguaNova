package linguaNova.examen_service.controller;

import linguaNova.examen_service.entity.StudentProfile;
import linguaNova.examen_service.service.StudentProfileService;
import linguaNova.examen_service.dto.UserResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student-profiles")
@Tag(name = "Profils Étudiants", description = "API de gestion des profils étudiants")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    // CREATE - Créer un nouveau profil étudiant
    @PostMapping
    public ResponseEntity<StudentProfile> createStudentProfile(@Valid @RequestBody StudentProfile studentProfile) {
        StudentProfile createdProfile = studentProfileService.createStudentProfile(studentProfile);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProfile);
    }

    // READ - Récupérer tous les profils étudiants
    @GetMapping
    public ResponseEntity<List<StudentProfile>> getAllStudentProfiles() {
        List<StudentProfile> profiles = studentProfileService.getAllStudentProfiles();
        return ResponseEntity.ok(profiles);
    }

    // READ - Récupérer un profil étudiant par ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentProfile> getStudentProfileById(@PathVariable Long id) {
        try {
            StudentProfile profile = studentProfileService.getStudentProfileById(id);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // UPDATE - Mettre à jour un profil étudiant
    @PutMapping("/{id}")
    public ResponseEntity<StudentProfile> updateStudentProfile(@PathVariable Long id, @Valid @RequestBody StudentProfile studentProfile) {
        try {
            StudentProfile updatedProfile = studentProfileService.updateStudentProfile(id, studentProfile);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // DELETE - Supprimer un profil étudiant
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudentProfile(@PathVariable Long id) {
        try {
            studentProfileService.deleteStudentProfile(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // GET - Récupérer le profil étudiant par userId (clé du user-service)
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<StudentProfile> getStudentProfileByUserId(@PathVariable Long userId) {
        return studentProfileService.getStudentProfileByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET - Récupérer les infos utilisateur enrichies depuis le user-service
    @GetMapping("/{id}/user-info")
    public ResponseEntity<UserResponse> getUserInfoByStudentProfileId(@PathVariable Long id) {
        try {
            UserResponse user = studentProfileService.getUserInfoByStudentProfileId(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}
