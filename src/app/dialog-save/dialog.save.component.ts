import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'dialog-save-component',
    templateUrl: 'dialog.save.component.html',
})
export class DialogSaveComponent {

    constructor(
        public dialogRef: MatDialogRef<DialogSaveComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.data.save_as_name=null
        this.dialogRef.close();
    }

}