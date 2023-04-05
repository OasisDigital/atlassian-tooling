import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'aait-aait-feature-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './aait-feature-shell.component.html',
  styleUrls: ['./aait-feature-shell.component.scss'],
})
export class AaitFeatureShellComponent {
  someAPIData = 'bar';

  // constructor(http: HttpClient) {
  // http
  //   .get<string>('https://oasis-expium-aait.atlassian.net/rest/api/3/users')
  //   .subscribe((data) => (this.someAPIData = data));
  // }
}
