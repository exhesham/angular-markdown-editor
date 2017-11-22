import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'color-pallate',
  styleUrls: ['color.pallate.component.css'],
  templateUrl: 'color.pallate.component.html',
})
export class ColorPallateComponent {
  @Output() onColorPicked = new EventEmitter<string>();
  pick_color($event: Event) {
    let clicked_rgb = $event.srcElement.getAttribute('style').split('background-color: ')[1].replace(';','')
    this.onColorPicked.emit(clicked_rgb)
  }
}
