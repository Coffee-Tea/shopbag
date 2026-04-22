import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IDictionaryItem } from '../models/item.model';

interface IDictionaryData {
  version: number;
  locale: string;
  items: IDictionaryItem[];
}

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  private readonly http = inject(HttpClient);
  private readonly itemsSignal = signal<IDictionaryItem[]>([]);

  readonly items = this.itemsSignal.asReadonly();

  constructor() {
    this.load();
  }

  private load(): void {
    this.http.get<IDictionaryData>('/assets/starter-dictionary.json').subscribe({
      next: (data) => this.itemsSignal.set(data.items),
      error: () => {
        // TODO: handle later, dictionary is optional
      },
    });
  }

  search(query: string): IDictionaryItem[] {
    if (!query || query.length < 2) return [];

    const normalized = query.toLowerCase().trim();

    return this.itemsSignal()
      .filter((item) => item.name.toLowerCase().startsWith(normalized))
      .slice(0, 5);
  }
}
