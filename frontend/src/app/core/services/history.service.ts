import { Injectable, signal } from '@angular/core';
import { HistoryEntry } from '../models/budget.model';

const HISTORY_STORAGE_KEY = 'paiesim_historique';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  readonly history = signal<HistoryEntry[]>(this.readHistory());

  private readHistory(): HistoryEntry[] {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    } catch {
      return [];
    }
  }

  list(): HistoryEntry[] {
    return this.history();
  }

  reload(): void {
    this.history.set(this.readHistory());
  }

  private persist(list: HistoryEntry[]): void {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
    this.history.set(list);
  }

  add(entry: HistoryEntry): void {
    this.persist([...this.list(), entry]);
  }

  remove(id: string): void {
    this.persist(this.list().filter(entry => entry.id !== id));
  }

  clear(): void {
    this.persist([]);
  }

  findById(id: string): HistoryEntry | undefined {
    return this.list().find(entry => entry.id === id);
  }
}
