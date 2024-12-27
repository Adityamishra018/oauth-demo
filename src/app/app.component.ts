import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <h1>This is an oauth Demo</h1>
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
  title = 'oauth-demo';
}
