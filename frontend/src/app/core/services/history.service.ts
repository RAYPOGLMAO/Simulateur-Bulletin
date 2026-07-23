import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { HistoryEntry } from '../models/budget.model';

const API_URL = '/api/simulations';

interface SimulationResponse {
  id: number;
  employee_name: string;
  input: any;
  result: any;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  readonly history = signal<HistoryEntry[]>([]);

  constructor(private http: HttpClient) {}

  list(): HistoryEntry[] {
    return this.history();
  }

  load(): Observable<SimulationResponse[]> {
    return this.http.get<SimulationResponse[]>(API_URL).pipe(
      tap((simulations) => {
        const entries: HistoryEntry[] = simulations.map(sim => ({
          id: String(sim.id),
          date: new Date(sim.created_at).toLocaleString('fr-FR'),
          input: sim.input,
          result: sim.result
        }));
        this.history.set(entries);
      })
    );
  }

  add(entry: HistoryEntry): Observable<any> {
    return this.http.post<any>(API_URL, {
      input: entry.input,
      result: entry.result
    }).pipe(
      tap((res) => {
        const newEntry: HistoryEntry = {
          id: String(res.id),
          date: new Date().toLocaleString('fr-FR'),
          input: entry.input,
          result: entry.result
        };
        this.history.set([newEntry, ...this.history()]);
      })
    );
  }

  remove(id: string): Observable<any> {
    return this.http.delete<any>(`${API_URL}/${id}`).pipe(
      tap(() => {
        this.history.set(this.history().filter(entry => entry.id !== id));
      })
    );
  }

  clear(): Observable<any> {
    return this.http.delete<any>(API_URL).pipe(
      tap(() => this.history.set([]))
    );
  }

  findById(id: string): HistoryEntry | undefined {
    return this.history().find(entry => entry.id === id);
  }
}
