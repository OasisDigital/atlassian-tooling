import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';

import { ApRequestService, ApService } from '@aait/data-access-jira';
@Component({
  selector: 'aait-aait-feature-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './aait-feature-shell.component.html',
  styleUrls: ['./aait-feature-shell.component.scss'],
})
export class AaitFeatureShellComponent {
  timezone: Observable<string>;
  token: Observable<string>;
  someApiData: any;

  constructor(apRequest: ApRequestService, ap: ApService) {
    this.timezone = ap.getTimeZone();
    this.token = ap.getToken();
    this.someApiData = apRequest.get('/rest/api/3/issue/TP-1');
  }
}
