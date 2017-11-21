/**
 * Created by hishamy on 21/11/2017.
 */
import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'dialog-link-edit',
  templateUrl: './link.component.html',
})
export class DialogLinkEdit {

  constructor(
    public dialogRef: MatDialogRef<DialogLinkEdit>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
