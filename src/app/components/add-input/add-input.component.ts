import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HistoryService } from '../../services/history.service';
import { DictionaryService } from '../../services/dictionary.service';
import { IconComponent } from '../icon/icon.component';

interface ISuggestion {
  name: string;
  displayName: string;
  source: 'history' | 'dictionary';
}

@Component({
  selector: 'sb-add-input',
  imports: [FormsModule, IconComponent],
  templateUrl: './add-input.component.html',
  styleUrl: './add-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddInputComponent {
  private readonly historyService = inject(HistoryService);
  private readonly dictionaryService = inject(DictionaryService);
  private readonly injector = inject(Injector);

  private readonly amountField = viewChild<ElementRef<HTMLInputElement>>('amountField');

  readonly add = output<{ name: string; amount: string }>();

  readonly name = signal('');
  readonly amount = signal('');
  readonly showAmount = signal(false);

  readonly suggestions = computed<ISuggestion[]>(() => {
    const query = this.name();

    if (!query || query.length < 2) return [];

    const historyResults: ISuggestion[] = this.historyService.search(query).map((e) => ({
      name: e.name,
      displayName: e.displayName,
      source: 'history',
    }));

    const dictionaryResults: ISuggestion[] = this.dictionaryService.search(query).map((d) => ({
      name: d.name.toLowerCase(),
      displayName: d.name,
      source: 'dictionary',
    }));

    const seen = new Set(historyResults.map((h) => h.name));
    const merged = [...historyResults];

    for (const d of dictionaryResults) {
      if (!seen.has(d.name)) {
        merged.push(d);
        seen.add(d.name);
      }
    }

    return merged.slice(0, 5);
  });

  readonly ghostText = computed(() => {
    const query = this.name();
    const first = this.suggestions()[0];

    if (!first || !query) return '';

    const queryLower = query.toLowerCase();

    if (first.name.startsWith(queryLower)) {
      return first.name.slice(queryLower.length);
    }

    return '';
  });

  toggleAmountField(): void {
    this.showAmount.set(true);

    afterNextRender(
      () => this.amountField()?.nativeElement.focus(),
      { injector: this.injector },
    );
  }

  acceptSuggestion(suggestion: ISuggestion): void {
    this.name.set(suggestion.displayName);
  }

  addItem(): void {
    const nameValue = this.name().trim();

    if (!nameValue) return;

    const amountValue = this.amount().trim();
    this.add.emit({ name: nameValue, amount: amountValue });
    this.name.set('');
    this.amount.set('');
    this.showAmount.set(false);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addItem();
    } else if (event.key === 'Tab' && this.ghostText()) {
      event.preventDefault();

      const first = this.suggestions()[0];

      if (first) {
        this.acceptSuggestion(first);
      }
    }
  }
}
