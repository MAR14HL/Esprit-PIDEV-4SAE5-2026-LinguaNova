import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentExamService } from '../../../core/services/student-exam.service';
import { ExamStudentProfileService } from '../../../core/services/exam-student-profile.service';
import { StudentExam } from '../../../core/models/exam-student-exam.model';
import { ExamStudentProfile } from '../../../core/models/exam-student-profile.model';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent implements OnInit {
  private studentExamService = inject(StudentExamService);
  private profileService = inject(ExamStudentProfileService);

  profiles = signal<ExamStudentProfile[]>([]);
  results = signal<StudentExam[]>([]);
  loading = signal(true);
  error = signal('');
  selectedProfileId = signal<number | null>(null);

  ngOnInit(): void {
    this.profileService.getAll().subscribe({
      next: (profiles) => {
        this.profiles.set(profiles);
        // Charge automatiquement les résultats du premier profil
        if (profiles.length > 0) {
          this.loadResults(profiles[0].id!);
          this.selectedProfileId.set(profiles[0].id!);
        } else {
          this.loading.set(false);
        }
      },
      error: () => { this.error.set('Erreur lors du chargement des profils.'); this.loading.set(false); }
    });
  }

  loadResults(profileId: number): void {
    this.loading.set(true);
    this.selectedProfileId.set(profileId);
    this.studentExamService.getByStudentProfileId(profileId).subscribe({
      next: (res) => { this.results.set(res); this.loading.set(false); },
      error: () => { this.error.set('Erreur lors du chargement des résultats.'); this.loading.set(false); }
    });
  }

  getPercentage(result: StudentExam): number {
    const max = result.exam?.maxScore;
    if (!max || max === 0) return 0;
    return Math.round(((result.score ?? 0) / max) * 100);
  }

  getGradeColor(pct: number): string {
    if (pct >= 75) return 'text-green-600';
    if (pct >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }
}
