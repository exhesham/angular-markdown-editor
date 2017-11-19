/**
 * Created by hishamy on 16/11/2017.
 */
import {
  AfterViewInit, Component, ElementRef, EmbeddedViewRef, EventEmitter, Output, Renderer, Renderer2, ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ViewData} from "@angular/core/src/view";

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

  constructor(private renderer : Renderer2){}
  p: any;
  ngAfterViewInit(): void {
    this.renderer.parentNode(this.richtextbox)

    this.p = this.renderer.createElement( 'p')
    const text = this.renderer.createText('Click here to add li');
    this.renderer.appendChild(this.p, text);
    this.renderer.appendChild(this.abcd.nativeElement, this.p);
    this.renderer.setAttribute(this.p, 'contenteditable','true')
    this.renderer.listen(this.p, 'keypress', this.keypress_decorator(this.p));
    this.p.focus()

    //p.setElementAttribute(null, 'contenteditable','true')
    // this.renderer.setProperty(p.nativeElement,)

    //
    //this.richtextbox.insert(p);

  }
  editor_keypress(e) {
  }

  apply_bold(event){
    let [startOffset, lastOffset] = this.get_caret_position()
    

  }
  get_caret_position(){
    console.log('applying bold')

    var doc = this.p.ownerDocument || this.p.document;
    var win = doc.defaultView || doc.parentWindow;
    var caretOffset = 0;
    var sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(this.p);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    } else if ((sel = doc.selection) && sel.type != "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(this.p);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }

    console.log(caretOffset)    //this is the caret offset
    console.log(sel.anchorOffset) // this is the start of the selection - if equal to offset then no selection
    this.p.focus()
    return [sel.anchorOffset, caretOffset]
  }


  private view_keypress(view1) {
    console.log('i am a view:', view1.elementRef);
    let p = this.renderer.createElement( 'p')
  }

  private keypress_decorator(p: any) {
    return (event) =>{
      if(event.key === 'b'){
        // console.log(event.target.innerText)
        // const text = this.renderer.createText('Click here to add li 2');
        // let p2 = this.renderer.createElement( 'p')
        // this.renderer.listen(p2, 'keypress', this.keypress_decorator(p2));
        // this.renderer.appendChild(p2, text);
        // p.appendChild(p2)
      }
    }
  }
}
