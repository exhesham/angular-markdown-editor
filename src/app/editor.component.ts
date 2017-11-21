/**
 * Created by hishamy on 16/11/2017.
 */
import {
  AfterViewInit, Component, ElementRef, Renderer2, ViewChild,
  ViewContainerRef
} from '@angular/core';


enum ElementType {
  p,
  span,
  bold,
  italic,
  quote,
  underline,
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']

})

export class EditorComponent implements AfterViewInit {


  @ViewChild('richtextbox', {read: ViewContainerRef}) richtextbox: ViewContainerRef;
  @ViewChild('p_dom') p_dom;
  @ViewChild('abcd')
  private abcd: ElementRef;
  private last_focused_element: any;

  constructor(private renderer: Renderer2) {

  }

  ngAfterViewInit(): void {
    this.renderer.parentNode(this.richtextbox)
    let p = this.inject_new_element(ElementType.p, 'I am a text', this.abcd.nativeElement);
    p.focus()


  }

  get_focused_element(): any {
    return window.getSelection().focusNode;
  }

  get_selection_text() {
    var min = 0;
    var max = 0;
    var text = "";
    var ranges = [];

    if (window.getSelection) {
      text = window.getSelection().toString();
      min = window.getSelection().focusOffset
      max = window.getSelection().anchorOffset
      for(let i = 0;i<window.getSelection().rangeCount;i++){
        ranges.push(window.getSelection().getRangeAt(i).commonAncestorContainer)
      }
    } else if (document.getSelection() && document.getSelection().type != "Control") {
      let text = document.createRange();
      ranges.push(text.commonAncestorContainer);
      min = document.getSelection().focusOffset
      max = document.getSelection().anchorOffset

    }
    return [Math.min(min,max),
      Math.max(min,max),
      text, ranges];
  }

  apply_bold(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
    document.execCommand('bold');
  }
  apply_italic(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
    document.execCommand('italic');
  }
  apply_underline(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
    document.execCommand('underline');
  }

  get_caret_position() {
    var win = window;
    var caretOffset = 0;
    var sel = win.getSelection();

    return [Math.min(sel.focusOffset, sel.anchorOffset), Math.max(sel.focusOffset, sel.anchorOffset)]
  }


  private view_keypress(view1) {
    console.log('i am a view:', view1.elementRef);
    let p = this.renderer.createElement('p')
  }

  private keypress_decorator(p: any) {
    return (event) => {
      if (event.key === 'Enter') {
      }
    }
  }

  private click_decorator(p: any) {
    return (event) => {
      p.focus()
    }
  }

  private inject_new_element(element_type: ElementType, text: string, parent: any) {
    let name = 'p';
    switch (element_type) {
      case ElementType.bold:
        name = 'b';
        break;
      case ElementType.italic:
        name = 'i';
        break;
      case ElementType.span:
        name = 'span';
        break;
    }
    let new_element = this.renderer.createElement(name)

    const text_element = this.renderer.createText(text);
    this.renderer.appendChild(new_element, text_element);
    this.renderer.appendChild(parent, new_element);
    this.renderer.setAttribute(new_element, 'contenteditable', 'true')
    this.renderer.listen(new_element, 'keypress', this.keypress_decorator(new_element));
    this.renderer.listen(new_element, 'click', this.click_decorator(new_element));
    // this.renderer.listen(new_element, 'focus', this.focus_decorator(new_element));
    new_element.focus()
    return new_element;
  }
}
