import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  title = 'app';
  constructor(public snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string) {
    console.log('saving....');
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
