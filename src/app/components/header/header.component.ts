import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'sb-header',
  imports: [IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly themeService = inject(ThemeService);

  readonly totalCount = input.required<number>();
  readonly boughtCount = input.required<number>();

  readonly markAllBought = output<void>();
  readonly clearAll = output<void>();

  readonly menuOpen = signal(false);
  readonly isDark = this.themeService.isDark;

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  closeAndMarkAllBought(): void {
    this.closeMenu();
    this.markAllBought.emit();
  }

  closeAndClearAll(): void {
    this.closeMenu();
    this.clearAll.emit();
  }

  onToggleTheme(): void {
    this.closeMenu();
    this.themeService.toggle();
  }
}
