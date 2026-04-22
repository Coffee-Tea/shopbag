import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ItemsService } from '../../services/items.service';
import { ToastService } from '../../services/toast.service';
import { DialogService } from '../../services/dialog.service';
import { ItemRowComponent } from '../item-row/item-row.component';
import { BoughtSectionHeaderComponent } from '../bought-section-header/bought-section-header.component';
import { IItem } from '../../models/item.model';

@Component({
  selector: 'sb-item-list',
  imports: [ItemRowComponent, BoughtSectionHeaderComponent],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemListComponent {
  private readonly itemsService = inject(ItemsService);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);

  readonly unboughtItems = this.itemsService.unboughtItems;
  readonly boughtItems = this.itemsService.boughtItems;
  readonly boughtCount = this.itemsService.boughtCount;

  toggleItem(id: string): void {
    this.itemsService.toggleBought(id);
  }

  deleteItem(id: string): void {
    const deleted = this.itemsService.delete(id);

    if (deleted) {
      this.toastService.showUndo(
        deleted,
        (item: IItem) => this.itemsService.commitDelete(item),
        (item: IItem) => this.itemsService.restore(item),
      );
    }
  }

  updateItem(event: { id: string; changes: Partial<IItem> }): void {
    this.itemsService.update(event.id, event.changes);
  }

  async uncheckAll(): Promise<void> {
    const count = this.boughtCount();
    const confirmed = await this.dialogService.confirm({
      title: `Move ${count} ${count === 1 ? 'item' : 'items'} back to list?`,
      confirmLabel: 'Move back',
      destructive: false,
    });

    if (confirmed) {
      this.itemsService.uncheckAll();
    }
  }

  async clearBought(): Promise<void> {
    const count = this.boughtCount();
    const confirmed = await this.dialogService.confirm({
      title: `Delete ${count} bought ${count === 1 ? 'item' : 'items'}?`,
      subtitle: "They can't be recovered.",
      confirmLabel: 'Delete',
      destructive: true,
    });

    if (confirmed) {
      this.itemsService.clearBought();
    }
  }
}
