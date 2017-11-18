/**
 * Created by hishamy on 16/11/2017.
 */
import {
  AfterViewInit, Component, ElementRef, EmbeddedViewRef, Renderer, Renderer2, ViewChild, ViewContainerRef
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

  ngAfterViewInit(): void {
    // insert a p element

    let view1 = this.p_dom.createEmbeddedView(null)
    this.renderer.parentNode(this.richtextbox)
    let p = this.renderer.createElement( 'p')
    const text = this.renderer.createText('Click here to add li');
    this.renderer.appendChild(p, text);
    this.renderer.appendChild(this.abcd.nativeElement, p);
    this.renderer.setAttribute(p, 'contenteditable','true')
    this.renderer.listen(p, 'keypress', this.keypress_decorator(p));
    //p.setElementAttribute(null, 'contenteditable','true')
    // this.renderer.setProperty(p.nativeElement,)

    //
    //this.richtextbox.insert(p);

  }
  editor_keypress(e) {
    let dom = e.currentTarget


    if (e.key === 'Enter') {
      let index = this.richtextbox.indexOf(dom);

      console.log('dom = ', dom)
      console.log('index = ', index)
      let view2 = this.p_dom.createEmbeddedView(null)
      this.renderer.listen(view2, 'click', this.view_keypress);
      this.richtextbox.insert(view2,index+1);
    }
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
        //
        // p.appendChild(p2)
      }
    }
  }
}
