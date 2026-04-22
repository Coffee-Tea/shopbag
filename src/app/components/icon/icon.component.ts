import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { InputSignal } from '@angular/core';

type IconName = 'check' | 'dots-vertical' | 'moon' | 'plus' | 'shopping-bag' | 'sun' | 'trash';

@Component({
  selector: 'sb-icon',
  templateUrl: './icon.component.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name: InputSignal<IconName> = input.required<IconName>();
  readonly size: InputSignal<number> = input<number>(16);
  readonly strokeWidth: InputSignal<number> = input<number>(2);
}
