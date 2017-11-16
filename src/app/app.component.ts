import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  constructor(public snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string) {
    console.log('saving....');
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
