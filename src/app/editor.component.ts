/**
 * Created by hishamy on 16/11/2017.
 */
import {
  AfterViewInit, Component, ElementRef, Renderer2, ViewChild,
  ViewContainerRef
} from '@angular/core';


enum ElementType{
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

export class EditorComponent  implements AfterViewInit {


  @ViewChild('richtextbox', {read: ViewContainerRef}) richtextbox: ViewContainerRef;
  @ViewChild('p_dom') p_dom;
  @ViewChild('abcd')
  private abcd: ElementRef;
  private last_focused_element: any;

  constructor(private renderer : Renderer2){

  }

  ngAfterViewInit(): void {
    this.renderer.parentNode(this.richtextbox)
    let p = this.inject_new_element(ElementType.p, 'I am a text', this.abcd.nativeElement);
    p.focus()

    console.log(this.get_focused_element())
  }
  get_focused_element(): any {
    console.log(this.last_focused_element)
    return this.last_focused_element
  }
  apply_bold(event){
    let focused_element = window.getSelection().focusNode;
    let [start_offset, last_offset] = this.get_caret_position();    // get the selected text
    let native_val = window.getSelection().focusNode.nodeValue;  // get the text itself
    console.log('native_val:',native_val)
    let left_val = native_val.substring(0,start_offset);   // need to split the string
    let right_val = last_offset <= native_val.length? native_val.substring(last_offset) : '';  // empty string if the caret is at the end of the element
    let parent = focused_element.parentElement;
    console.log('start_offset, last_offset:',start_offset, last_offset)

    console.log('left_val:',left_val)
    console.log('right_val:',right_val)
    console.log('focused:',focused_element)
    console.log('parent of focused:',parent)
    let new_wrapper_child = this.inject_new_element(ElementType.p, '',parent)
    let selected_substring = native_val.substring(start_offset, last_offset);
    let left_element = this.inject_new_element(ElementType.span,left_val, new_wrapper_child);   // put the right substring in a new element right to the bold
    let bold = this.inject_new_element(ElementType.bold,selected_substring, new_wrapper_child );   // create bold dom
    //TODO: the new right element type should be the same as the focused_element
    let right_element = this.inject_new_element(ElementType.span,right_val, new_wrapper_child );   // put the right substring in a new element right to the bold
    this.renderer.removeChild(focused_element.parentElement, focused_element)
    bold.focus();
  }
  get_caret_position(){
    var win = window;
    var caretOffset = 0;
    var sel = win.getSelection();

    return [Math.min(sel.focusOffset,sel.anchorOffset), Math.max(sel.focusOffset,sel.anchorOffset)]
  }


  private view_keypress(view1) {
    console.log('i am a view:', view1.elementRef);
    let p = this.renderer.createElement( 'p')
  }

  private keypress_decorator(p: any) {
    return (event) =>{
      if(event.key === 'Enter'){
      }
    }
  }
  private focus_decorator(p: any) {
    return (event) =>{
      this.last_focused_element = p
    }
  }

  private inject_new_element(element_type: ElementType, text: string, parent: any) {
    let name = 'p';
    switch (element_type){
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
    this.renderer.setAttribute(new_element, 'contenteditable','true')
    this.renderer.listen(new_element, 'keypress', this.keypress_decorator(new_element));
    this.renderer.listen(new_element, 'focus', this.focus_decorator(new_element));

    return new_element;
  }
}
