import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BackToTop } from '../../components/back-to-top/back-to-top';
import { CONFIGURATION } from '../../utils/theme';

@Component({
  selector: 'app-content-layout',
  imports: [RouterModule, BackToTop],
  template: `
    <div class="pp-page">
      <header class="pp-topbar">
        <a routerLink="/views-supplier" class="pp-topbar__brand">
          <img src="./images/parker-ligthh.png" alt="Parker" class="pp-topbar__logo me-3" />
          <span class="pp-topbar__title ms-3">PORTAL DE PROVEEDORES</span>
        </a>

        <a routerLink="/views-supplier" class="pp-topbar__action" title="Inicio" aria-label="Ir al inicio">
          <i class="bi bi-house"></i>
        </a>
      </header>
      <main class="pp-main">
        <router-outlet />
      </main>

      <footer class="pp-footer is-visible">
        <img src="./images/parker-ligthh.png" alt="Parker" class="pp-topbar__logo" />
        <span class="pp-footer__tagline">
          ENGINEERING <span class="pp-footer__word-your">YOUR</span> SUCCESS.
        </span>
        <span class="pp-footer__copy">© 2026 Parker Hannifin Corp.</span>
        <nav class="pp-footer__links">
          <a href="#">Seguridad</a>
          <span>|</span>
          <a href="#">Condiciones</a>
        </nav>
      </footer>
    </div>
    <app-back-to-top />
  `,
  styleUrl: './content-layout.scss',
})
export class ContentLayout {

}
