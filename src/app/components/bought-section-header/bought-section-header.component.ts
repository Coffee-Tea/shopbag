import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'sb-bought-section-header',
  imports: [],
  templateUrl: './bought-section-header.component.html',
  styleUrl: './bought-section-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoughtSectionHeaderComponent {
  readonly count = input.required<number>();

  readonly uncheckAll = output<void>();
  readonly clearBought = output<void>();
}
