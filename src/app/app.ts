import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './shared/services/loader-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected loaderService = inject(LoaderService);

  constructor() {
    // effect(() => {
    //   const authenticated = this.signInService.isAuthenticated();

    //   if (authenticated) {
    //     this.idleService.start();
    //   } else {
    //     this.idleService.stop();
    //   }
    // });
  }
}
