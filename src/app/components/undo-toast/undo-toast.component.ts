import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'sb-undo-toast',
  imports: [],
  templateUrl: './undo-toast.component.html',
  styleUrl: './undo-toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoToastComponent {
  private readonly toastService = inject(ToastService);

  readonly toast = this.toastService.undoToast;
  readonly errorToast = this.toastService.errorToast;
  readonly progress = this.toastService.progress;

  undo(): void {
    const current = this.toast();

    if (current) {
      current.onUndo();
    }
  }

  dismissError(): void {
    this.toastService.dismissError();
  }
}
