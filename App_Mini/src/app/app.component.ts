import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { IdeComponent } from './ide/ide.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule,RouterOutlet,IdeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'App_Mini';
}
