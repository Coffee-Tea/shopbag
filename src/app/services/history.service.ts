import { Injectable, signal } from '@angular/core';
import { IHistoryEntry } from '../models/item.model';

const STORAGE_KEY = 'shopbag:history';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private readonly entriesSignal = signal<IHistoryEntry[]>([]);
  readonly entries = this.entriesSignal.asReadonly();

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        this.entriesSignal.set(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors for now
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entriesSignal()));
    } catch {
      // ignore storage errors for now
    }
  }

  record(name: string, amount: string): void {
    const normalized = name.toLowerCase().trim();
    const entries = [...this.entriesSignal()];
    const existingIndex = entries.findIndex((e) => e.name === normalized);
    const lastUsedAt = new Date().toISOString();

    if (existingIndex >= 0) {
      entries[existingIndex] = {
        ...entries[existingIndex],
        count: entries[existingIndex].count + 1,
        lastAmount: amount || entries[existingIndex].lastAmount,
        lastUsedAt,
      };
    } else {
      entries.push({
        name: normalized,
        displayName: name.trim(),
        count: 1,
        lastAmount: amount,
        lastUsedAt,
      });
    }

    this.entriesSignal.set(entries);
    this.save();
  }

  search(query: string): IHistoryEntry[] {
    if (!query || query.length < 2) return [];

    const normalized = query.toLowerCase().trim();
    return this.entriesSignal()
      .filter((e) => e.name.startsWith(normalized))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getAmountForName(name: string): string | undefined {
    const normalized = name.toLowerCase().trim();
    const entry = this.entriesSignal().find((e) => e.name === normalized);
    return entry?.lastAmount;
  }
}
