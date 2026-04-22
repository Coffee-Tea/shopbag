import { inject, Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialogComponent, IConfirmDialogData } from '../components/confirm-dialog/confirm-dialog.component';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly dialog = inject(Dialog);

  async confirm(config: IConfirmDialogData): Promise<boolean> {
    const dialogRef = this.dialog.open<boolean, IConfirmDialogData>(ConfirmDialogComponent, {
      data: config,
      panelClass: 'confirm-dialog-panel',
      backdropClass: 'confirm-dialog-backdrop',
    });

    return (await firstValueFrom(dialogRef.closed)) === true;
  }
}
