import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'sb-empty-state',
  imports: [IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {}
