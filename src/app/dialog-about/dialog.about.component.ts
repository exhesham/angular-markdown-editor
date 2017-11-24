/**
 * Created by hishamy on 21/11/2017.
 */
import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dialog-about',
  templateUrl: './dialog.about.component.html',
})
export class DialogAbout {

  constructor(
    public dialogRef: MatDialogRef<DialogAbout>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
