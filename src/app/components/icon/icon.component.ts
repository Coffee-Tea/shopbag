import { ChangeDetectionStrategy, Component, input } from '@angular/core';

type IconName = 'check' | 'dots-vertical' | 'moon' | 'plus' | 'shopping-bag' | 'sun' | 'trash';

@Component({
  selector: 'sb-icon',
  templateUrl: './icon.component.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<number>(16);
  readonly strokeWidth = input<number>(2);
}
