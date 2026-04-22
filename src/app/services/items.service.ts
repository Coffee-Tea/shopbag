import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IItem } from '../models/item.model';
import { byOrder } from '../models/item.util';
import { ToastService } from './toast.service';
import { HistoryService } from './history.service';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly historyService = inject(HistoryService);
  private readonly apiUrl = '/api/items';

  private readonly itemsSignal = signal<IItem[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly loadFailedSignal = signal(false);
  private readonly pendingDeleteIds = new Set<string>();

  readonly items = this.itemsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly loadFailed = this.loadFailedSignal.asReadonly();

  readonly unboughtItems = computed(() =>
    this.itemsSignal()
      .filter((item) => !item.bought)
      .sort(byOrder),
  );

  readonly boughtItems = computed(() =>
    this.itemsSignal()
      .filter((item) => item.bought)
      .sort(byOrder),
  );

  readonly totalCount = computed(() => this.itemsSignal().length);
  readonly boughtCount = computed(() => this.boughtItems().length);

  load(): void {
    this.loadingSignal.set(true);
    this.loadFailedSignal.set(false);

    this.http.get<IItem[]>(this.apiUrl).subscribe({
      next: (items) => {
        this.itemsSignal.set(items.filter((item) => !this.pendingDeleteIds.has(item.id)));
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
        this.loadFailedSignal.set(true);
        this.toastService.showError('Failed to load items');
      },
    });
  }

  add(name: string, amount: string): void {
    const maxOrder = Math.max(0, ...this.itemsSignal().map((i) => i.order));
    const newItem: Omit<IItem, 'id'> = {
      listId: 'primary',
      name: name.trim(),
      amount: amount.trim(),
      bought: false,
      createdAt: new Date().toISOString(),
      order: maxOrder + 1,
    };

    this.http.post<IItem>(this.apiUrl, newItem).subscribe({
      next: (item) => {
        this.itemsSignal.update((items) => [...items, item]);
        this.historyService.record(item.name, item.amount);
      },
      error: () => this.toastService.showError('Failed to add item'),
    });
  }

  update(id: string, changes: Partial<IItem>): void {
    const previousItem = this.itemsSignal().find((item) => item.id === id);

    if (!previousItem) return;

    const optimisticItem = { ...previousItem, ...changes };
    this.itemsSignal.update((items) => items.map((item) => (item.id === id ? optimisticItem : item)));

    this.http.patch<IItem>(this.itemUrl(id), changes).subscribe({
      error: () => {
        const keys = Object.keys(changes) as (keyof IItem)[];

        this.itemsSignal.update((items) =>
          items.map((item) => {
            if (item.id !== id) return item;

            const isStillOptimistic = keys.every((k) => item[k] === optimisticItem[k]);

            return isStillOptimistic ? previousItem : item;
          }),
        );
        this.toastService.showError('Failed to save changes');
      },
    });
  }

  delete(id: string): IItem | undefined {
    const deleted = this.itemsSignal().find((item) => item.id === id);

    if (!deleted) return undefined;

    this.pendingDeleteIds.add(id);
    this.itemsSignal.update((items) => items.filter((item) => item.id !== id));

    return deleted;
  }

  commitDelete(item: IItem): void {
    if (!this.pendingDeleteIds.has(item.id)) {
      return;
    }

    this.delete$(item.id).subscribe({
      next: () => {
        this.pendingDeleteIds.delete(item.id);
      },
      error: () => {
        this.pendingDeleteIds.delete(item.id);
        this.restore(item);
        this.toastService.showError('Failed to delete item');
      },
    });
  }

  restore(item: IItem): void {
    this.pendingDeleteIds.delete(item.id);
    this.itemsSignal.update((items) => {
      if (items.some((current) => current.id === item.id)) {
        return items;
      }

      return [...items, item];
    });
  }

  toggleBought(id: string): void {
    const item = this.itemsSignal().find((i) => i.id === id);

    if (item) {
      this.update(id, { bought: !item.bought });
    }
  }

  clearBought(): void {
    const boughtIds = this.boughtItems().map((i) => i.id);

    if (!boughtIds.length) return;

    this.itemsSignal.update((items) => items.filter((item) => !item.bought));

    forkJoin(boughtIds.map((id) => this.delete$(id))).subscribe({
      error: () => {
        this.toastService.showError('Failed to clear bought items');
        this.load();
      },
    });
  }

  uncheckAll(): void {
    const boughtIds = this.boughtItems().map((i) => i.id);
    boughtIds.forEach((id) => this.update(id, { bought: false }));
  }

  markAllBought(): void {
    const unboughtIds = this.unboughtItems().map((i) => i.id);
    unboughtIds.forEach((id) => this.update(id, { bought: true }));
  }

  clearAll(): void {
    const allIds = this.itemsSignal().map((i) => i.id);

    if (!allIds.length) return;

    this.itemsSignal.set([]);

    forkJoin(allIds.map((id) => this.delete$(id))).subscribe({
      error: () => {
        this.toastService.showError('Failed to clear all items');
        this.load();
      },
    });
  }

  private itemUrl(id: string): string {
    return `${this.apiUrl}/${id}`;
  }

  private delete$(id: string): Observable<void> {
    return this.http.delete<void>(this.itemUrl(id));
  }
}
