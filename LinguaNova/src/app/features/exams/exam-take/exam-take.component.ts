import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ExamService } from '../../../core/services/exam.service';
import { StudentExamService } from '../../../core/services/student-exam.service';
import { ExamStudentProfileService } from '../../../core/services/exam-student-profile.service';
import { VoiceService } from '../../../core/services/voice.service';
import { AuthService } from '../../../core/services/auth.service';
import { Exam } from '../../../core/models/exam.model';
import { Question } from '../../../core/models/exam-question.model';
import { ExamStudentProfile } from '../../../core/models/exam-student-profile.model';

@Component({
  selector: 'app-exam-take',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './exam-take.component.html',
  styleUrls: ['./exam-take.component.scss'],
})
export class ExamTakeComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examService = inject(ExamService);
  private studentExamService = inject(StudentExamService);
  private profileService = inject(ExamStudentProfileService);
  private voiceService = inject(VoiceService);
  private authService = inject(AuthService);

  exam = signal<Exam | null>(null);
  profiles = signal<ExamStudentProfile[]>([]);
  selectedProfileId = signal<number | null>(null);
  currentIndex = signal(0);
  answers = signal<{ [questionId: number]: { textAnswer?: string; selectedReponseId?: number } }>({});
  loading = signal(true);
  submitting = signal(false);
  error = signal('');
  voiceMode = signal(false);
  voiceActive = signal(false);
  recognizedText = signal('');

  currentQuestion = computed<Question | null>(() => {
    const q = this.exam()?.questions;
    return q && q.length > this.currentIndex() ? q[this.currentIndex()] : null;
  });

  totalQuestions = computed(() => this.exam()?.questions?.length ?? 0);
  progress = computed(() => this.totalQuestions() === 0 ? 0 : Math.round(((this.currentIndex() + 1) / this.totalQuestions()) * 100));

  private examId!: number;
  private listenSub?: Subscription;

  ngOnInit(): void {
    this.examId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  ngOnDestroy(): void {
    this.listenSub?.unsubscribe();
    this.voiceService.stopListening();
    this.voiceService.stopSpeaking();
  }

  private loadData(): void {
    this.loading.set(true);
    this.examService.getById(this.examId).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.profileService.getAll().subscribe({
          next: (profiles) => {
            this.profiles.set(profiles);
            // Auto-sélectionner le profil correspondant à l'utilisateur connecté
            const currentUser = this.authService.currentUserValue;
            if (currentUser?.firstName && currentUser?.lastName) {
              const match = profiles.find(p =>
                p.firstName?.toLowerCase() === currentUser.firstName.toLowerCase() &&
                p.lastName?.toLowerCase() === currentUser.lastName.toLowerCase()
              );
              if (match?.id) this.selectedProfileId.set(match.id);
            }
            this.loading.set(false);
          },
          error: () => { this.error.set('Erreur lors du chargement des profils.'); this.loading.set(false); }
        });
      },
      error: () => { this.error.set('Erreur lors du chargement de l\'examen.'); this.loading.set(false); }
    });
  }

  selectReponse(questionId: number, reponseId: number): void {
    this.answers.update(a => ({ ...a, [questionId]: { selectedReponseId: reponseId } }));
  }

  setTextAnswer(questionId: number, text: string): void {
    this.answers.update(a => ({ ...a, [questionId]: { textAnswer: text } }));
  }

  isSelected(questionId: number, reponseId: number): boolean {
    return this.answers()[questionId]?.selectedReponseId === reponseId;
  }

  getTextAnswer(questionId: number): string {
    return this.answers()[questionId]?.textAnswer ?? '';
  }

  prev(): void {
    if (this.currentIndex() > 0) this.currentIndex.update(i => i - 1);
  }

  next(): void {
    if (this.currentIndex() < this.totalQuestions() - 1) this.currentIndex.update(i => i + 1);
  }

  goTo(idx: number): void { this.currentIndex.set(idx); }

  toggleVoiceMode(): void {
    this.voiceMode.update(v => !v);
    if (!this.voiceMode()) {
      this.voiceService.stopListening();
      this.listenSub?.unsubscribe();
      this.voiceActive.set(false);
    }
  }

  toggleListening(): void {
    if (this.voiceActive()) {
      this.voiceService.stopListening();
      this.listenSub?.unsubscribe();
      this.voiceActive.set(false);
    } else {
      this.voiceActive.set(true);
      this.listenSub = this.voiceService.listen().subscribe({
        next: (text: string) => {
          this.recognizedText.set(text);
          const q = this.currentQuestion();
          if (q?.id != null) {
            this.answers.update(a => ({ ...a, [q.id!]: { textAnswer: text } }));
          }
          this.voiceActive.set(false);
        },
        error: () => { this.voiceActive.set(false); }
      });
    }
  }

  readQuestion(): void {
    const q = this.currentQuestion();
    if (q) this.voiceService.speak(q.content);
  }

  submit(): void {
    if (!this.selectedProfileId()) {
      this.error.set('Veuillez sélectionner votre profil étudiant.');
      return;
    }
    this.submitting.set(true);
    const payload: any = {
      exam: { id: this.examId },
      studentProfile: { id: this.selectedProfileId() },
      answers: Object.entries(this.answers()).map(([qId, ans]) => ({
        question: { id: Number(qId) },
        textAnswer: ans.textAnswer ?? null,
        selectedReponse: ans.selectedReponseId ? { id: ans.selectedReponseId } : null,
      })),
    };
    this.studentExamService.submit(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/mes-resultats']);
      },
      error: () => {
        this.error.set('Erreur lors de la soumission de l\'examen.');
        this.submitting.set(false);
      }
    });
  }
}

