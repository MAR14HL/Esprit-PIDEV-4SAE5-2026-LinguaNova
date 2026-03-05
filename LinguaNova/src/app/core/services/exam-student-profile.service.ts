import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { ExamStudentProfile } from '../models/exam-student-profile.model';

@Injectable({ providedIn: 'root' })
export class ExamStudentProfileService {
  private readonly apiUrl = '/student-profiles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ExamStudentProfile[]> {
    return this.http.get<ExamStudentProfile[]>(this.apiUrl);
  }

  getById(id: number): Observable<ExamStudentProfile> {
    return this.http.get<ExamStudentProfile>(`${this.apiUrl}/${id}`);
  }

  create(profile: ExamStudentProfile): Observable<ExamStudentProfile> {
    return this.http.post<ExamStudentProfile>(this.apiUrl, profile);
  }

  update(id: number, profile: ExamStudentProfile): Observable<ExamStudentProfile> {
    return this.http.put<ExamStudentProfile>(`${this.apiUrl}/${id}`, profile);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
