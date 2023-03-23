import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'aait-aait-feature-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './aait-feature-shell.component.html',
  styleUrls: ['./aait-feature-shell.component.scss'],
})
export class AaitFeatureShellComponent {}
