import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IItem } from '../../models/item.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'sb-item-row',
  imports: [FormsModule, IconComponent],
  templateUrl: './item-row.component.html',
  styleUrl: './item-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemRowComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly injector = inject(Injector);

  readonly item = input.required<IItem>();

  readonly toggleBought = output<string>();
  readonly remove = output<string>();
  readonly update = output<{ id: string; changes: Partial<IItem> }>();

  readonly editing = signal(false);
  readonly nameValue = signal('');
  readonly amountValue = signal('');
  readonly showAmountInput = signal(false);

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly amountInput = viewChild<ElementRef<HTMLInputElement>>('amountInput');

  private isFocusTransitioning = false;

  @HostListener('focusout')
  onFocusOut(): void {
    this.saveEditIfFocusLeftComponent();
  }

  toggleItem(): void {
    if (this.editing()) {
      this.saveEdit();
    }

    this.toggleBought.emit(this.item().id);
  }

  deleteItem(): void {
    this.remove.emit(this.item().id);
  }

  startEdit(field: 'name' | 'amount'): void {
    this.isFocusTransitioning = true;
    this.editing.set(true);
    this.nameValue.set(this.item().name);
    this.amountValue.set(this.item().amount);
    this.showAmountInput.set(!!this.item().amount);

    afterNextRender(
      () => {
        const input = field === 'name' ? this.nameInput() : this.amountInput();

        if (input) {
          const el = input.nativeElement;
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }

        this.isFocusTransitioning = false;
      },
      { injector: this.injector },
    );
  }

  openAmountEdit(event: Event): void {
    event.stopPropagation();
    this.isFocusTransitioning = true;
    this.showAmountInput.set(true);

    afterNextRender(
      () => {
        const input = this.amountInput();

        if (input) {
          input.nativeElement.focus();
        }

        this.isFocusTransitioning = false;
      },
      { injector: this.injector },
    );
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit();
    }
  }

  saveEdit(): void {
    if (!this.editing()) return;

    const name = this.nameValue().trim();
    const amount = this.amountValue().trim();

    if (!name) {
      this.cancelEdit();
      return;
    }

    const current = this.item();
    const nameChanged = name !== current.name;
    const amountChanged = amount !== current.amount;

    if (nameChanged || amountChanged) {
      this.update.emit({
        id: current.id,
        changes: {
          ...(nameChanged ? { name } : {}),
          ...(amountChanged ? { amount } : {}),
        },
      });
    }

    this.editing.set(false);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  onFieldKeydown(event: KeyboardEvent, field: 'name' | 'amount'): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.startEdit(field);
    }
  }

  private saveEditIfFocusLeftComponent(): void {
    setTimeout(() => {
      if (!this.editing() || this.isFocusTransitioning) return;

      if (!this.elementRef.nativeElement.contains(document.activeElement)) {
        this.saveEdit();
      }
    });
  }
}
