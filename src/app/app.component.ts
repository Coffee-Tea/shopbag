import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ItemsService } from './services/items.service';
import { DialogService } from './services/dialog.service';
import { HeaderComponent } from './components/header/header.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { AddInputComponent } from './components/add-input/add-input.component';
import { UndoToastComponent } from './components/undo-toast/undo-toast.component';

@Component({
  selector: 'sb-root',
  imports: [HeaderComponent, ItemListComponent, EmptyStateComponent, AddInputComponent, UndoToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly itemsService = inject(ItemsService);
  private readonly dialogService = inject(DialogService);

  readonly totalCount = this.itemsService.totalCount;
  readonly boughtCount = this.itemsService.boughtCount;
  readonly loading = this.itemsService.loading;
  readonly loadFailed = this.itemsService.loadFailed;
  readonly isEmpty = computed(() => this.totalCount() === 0);
  readonly showLoading = computed(() => this.loading() && this.isEmpty());
  readonly showLoadError = computed(() => this.loadFailed() && this.isEmpty());
  readonly showEmptyState = computed(() => !this.showLoading() && !this.showLoadError() && this.isEmpty());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.itemsService.load();
  }

  addItem(event: { name: string; amount: string }): void {
    this.itemsService.add(event.name, event.amount);
  }

  async markAllBought(): Promise<void> {
    const unboughtCount = this.totalCount() - this.boughtCount();
    const confirmed = await this.dialogService.confirm({
      title: `Mark ${unboughtCount} ${unboughtCount === 1 ? 'item' : 'items'} as bought?`,
      confirmLabel: 'Mark as bought',
      destructive: false,
    });

    if (confirmed) {
      this.itemsService.markAllBought();
    }
  }

  async clearAll(): Promise<void> {
    const count = this.totalCount();
    const confirmed = await this.dialogService.confirm({
      title: `Delete all ${count} ${count === 1 ? 'item' : 'items'}?`,
      subtitle: "They can't be recovered.",
      confirmLabel: 'Delete',
      destructive: true,
    });

    if (confirmed) {
      this.itemsService.clearAll();
    }
  }
}
