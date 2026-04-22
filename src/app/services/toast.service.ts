import { Injectable, signal } from '@angular/core';
import { IItem } from '../models/item.model';

interface IUndoToastState {
  item: IItem;
  onUndo: () => void;
}

interface IErrorToastState {
  message: string;
}

interface IQueuedDelete {
  item: IItem;
  onExpire: (item: IItem) => void;
  onUndo: (item: IItem) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly undoToastSignal = signal<IUndoToastState | null>(null);
  private readonly errorToastSignal = signal<IErrorToastState | null>(null);
  private readonly progressSignal = signal(100);

  readonly undoToast = this.undoToastSignal.asReadonly();
  readonly errorToast = this.errorToastSignal.asReadonly();
  readonly progress = this.progressSignal.asReadonly();

  private undoTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private errorTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private readonly UNDO_DURATION = 5000;
  private readonly ERROR_DURATION = 3000;
  private deletedQueue: IQueuedDelete[] = [];

  showUndo(item: IItem, onExpire: (item: IItem) => void, onUndo: (item: IItem) => void): void {
    this.deletedQueue.unshift({ item, onExpire, onUndo });
    this.showCurrentUndo();
  }

  showError(message: string): void {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
    }

    this.errorToastSignal.set({ message });

    this.errorTimeoutId = setTimeout(() => {
      this.errorToastSignal.set(null);
      this.errorTimeoutId = null;
    }, this.ERROR_DURATION);
  }

  private showCurrentUndo(): void {
    const current = this.deletedQueue[0];

    if (!current) {
      this.clearUndo();
      return;
    }

    if (this.undoTimeoutId) {
      clearTimeout(this.undoTimeoutId);
    }

    this.undoTimeoutId = setTimeout(() => {
      const expired = this.deletedQueue.shift();
      this.undoTimeoutId = null;
      expired?.onExpire(expired.item);

      if (this.deletedQueue.length > 0) {
        this.showCurrentUndo();
      } else {
        this.clearUndo();
      }
    }, this.UNDO_DURATION);

    this.undoToastSignal.set({
      item: current.item,
      onUndo: () => {
        if (this.undoTimeoutId) {
          clearTimeout(this.undoTimeoutId);
        }

        this.undoTimeoutId = null;
        const restored = this.deletedQueue.shift();
        restored?.onUndo(restored.item);

        if (this.deletedQueue.length > 0) {
          this.showCurrentUndo();
        } else {
          this.clearUndo();
        }
      },
    });

    this.startProgress();
  }

  dismissError(): void {
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId);
      this.errorTimeoutId = null;
    }

    this.errorToastSignal.set(null);
  }

  private clearUndo(): void {
    this.stopProgress();
    this.undoToastSignal.set(null);
    this.progressSignal.set(100);
  }

  private startProgress(): void {
    this.stopProgress();
    this.progressSignal.set(100);
    const interval = 50;
    const decrement = (interval / this.UNDO_DURATION) * 100;

    this.progressInterval = setInterval(() => {
      const current = this.progressSignal();
      const next = Math.max(0, current - decrement);
      this.progressSignal.set(next);

      if (next <= 0) {
        this.stopProgress();
      }
    }, interval);
  }

  private stopProgress(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}
