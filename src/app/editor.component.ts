/**
 * Created by hishamy on 16/11/2017.
 */
import {
  AfterViewInit, Component, ElementRef, Renderer2, ViewChild,Inject,
  ViewContainerRef
} from '@angular/core';
import {DialogLinkEdit} from "./dialog-link/link.component";
import {ColorPallateComponent} from "./color-pallate/color.pallate.component";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormsModule } from '@angular/forms';

enum ElementType {
  tr,
  td,
  br,
  tbody,
  table,
  p,
  span,
  bold,
  italic,
  div,
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
  @ViewChild('edit')
  private edit: ElementRef;

  scales = [
    'Paragraph',
    'Heading1',
    'Heading2',
    'Heading3',
    'Heading4',
    'Heading5',

  ]
  constructor(private renderer: Renderer2,public dialog: MatDialog) {

  }

  ngAfterViewInit(): void {
    this.renderer.parentNode(this.richtextbox)

    let p = this.inject_new_element(ElementType.div, 'I am a text', this.edit.nativeElement);
    this.edit.nativeElement.focus();


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

  apply_bold() {
    //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
    document.execCommand('bold', false, null);
    this.edit.nativeElement.focus();
  }
  apply_italic(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
    document.execCommand('italic');
    this.edit.nativeElement.focus();
  }
  apply_underline(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
    document.execCommand('underline');
    this.edit.nativeElement.focus();
  }
  apply_quote(event) {
    //
    document.execCommand('formatBlock', true, 'blockquote');
    this.edit.nativeElement.focus();
  }
  apply_undo(event) {
    document.execCommand('undo');
    this.edit.nativeElement.focus();
  }
  apply_redo(event) {
    //
    document.execCommand('redo');
    this.edit.nativeElement.focus();
  }
  apply_code_format(event) {
    document.execCommand('formatBlock', true, 'code');
    this.edit.nativeElement.focus();
  }
  apply_strike_through(event) {
    document.execCommand('strikeThrough');
    this.edit.nativeElement.focus();
  }
  clear_format(event) {
    document.execCommand('removeFormat');
    this.edit.nativeElement.focus();
  }
  format_align_justify(event) {
    document.execCommand('justifyFull');
    this.edit.nativeElement.focus();
  }
  format_align_center(event) {
    document.execCommand('justifyCenter');
    this.edit.nativeElement.focus();
  }
  format_align_left(event) {
    document.execCommand('justifyLeft');
    this.edit.nativeElement.focus();
  }
  format_align_right(event) {
    document.execCommand('justifyRight');
    this.edit.nativeElement.focus();
  }

  insert_link(){
    console.log('insert link')

    var szURL = prompt("Enter a URL:", "http://");
    if ((szURL != null) && (szURL != "")) {
      document.execCommand("CreateLink",false,szURL);
    }
    this.edit.nativeElement.focus();
  }
  change_color(color:string){
    console.log('received color:', color);
    this.edit.nativeElement.focus();
    document.execCommand('forecolor', false, color);
    this.edit.nativeElement.focus();

  }
  get_caret_position() {
    var win = window;
    var caretOffset = 0;
    var sel = win.getSelection();

    return [Math.min(sel.focusOffset, sel.anchorOffset), Math.max(sel.focusOffset, sel.anchorOffset)]
  }
  insert_ordered_list(){
    document.execCommand('insertorderedlist',false,null);
  }
  insert_unordered_list(){
    document.execCommand('insertunorderedlist',false,null);
  }
  create_table() {
    // source: https://www-archive.mozilla.org/editor/midasdemo/
    // https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla#Executing_Commands
    let e = document.getSelection().focusNode;
    let rowstext = prompt("enter rows");
    let colstext = prompt("enter cols");
    let rows = parseInt(rowstext);
    let cols = parseInt(colstext);
    if ((rows > 0) && (cols > 0)) {
      let table = this.inject_new_element(ElementType.table,null,e)
      table.setAttribute("border", "1");
      table.setAttribute("cellpadding", "2");
      table.setAttribute("cellspacing", "2");
      let tbody = this.inject_new_element(ElementType.tbody,null,table)
      for (var i = 0; i < rows; i++) {
        let tr = this.inject_new_element(ElementType.tr,null,tbody);
        for (var j = 0; j < cols; j++) {
          let td = this.inject_new_element(ElementType.td,null,tr);
          let br = this.inject_new_element(ElementType.br,null,td);
        }
      }
      this.insertNodeAtSelection(e, table);
    }
  }
  insertNodeAtSelection(win, insertNode)
  {
    // get current selection
    var sel = win.getSelection();

    // get the first range of the selection
    // (there's almost always only one range)
    var range = sel.getRangeAt(0);

    // deselect everything
    sel.removeAllRanges();

    // remove content of current selection from document
    range.deleteContents();

    // get location of current selection
    var container = range.startContainer;
    var pos = range.startOffset;

    // make a new range for the new selection
    range=document.createRange();

    if (container.nodeType==3 && insertNode.nodeType==3) {

      // if we insert text in a textnode, do optimized insertion
      container.insertData(pos, insertNode.nodeValue);

      // put cursor after inserted text
      range.setEnd(container, pos+insertNode.length);
      range.setStart(container, pos+insertNode.length);

    } else {
      var afterNode;
      if (container.nodeType==3) {

        // when inserting into a textnode
        // we create 2 new textnodes
        // and put the insertNode in between

        var textNode = container;
        container = textNode.parentNode;
        var text = textNode.nodeValue;

        // text before the split
        var textBefore = text.substr(0,pos);
        // text after the split
        var textAfter = text.substr(pos);

        var beforeNode = document.createTextNode(textBefore);
        afterNode = document.createTextNode(textAfter);

        // insert the 3 new nodes before the old one
        container.insertBefore(afterNode, textNode);
        container.insertBefore(insertNode, afterNode);
        container.insertBefore(beforeNode, insertNode);

        // remove the old node
        container.removeChild(textNode);

      } else {

        // else simply insert the node
        afterNode = container.childNodes[pos];
        container.insertBefore(insertNode, afterNode);
      }

      range.setEnd(afterNode, 0);
      range.setStart(afterNode, 0);
    }
    sel.addRange(range);
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
    let name = ElementType[element_type];
    console.log('will inject ', name, ' under ', parent)
    let new_element = this.renderer.createElement(name)
    if (text != null) {
      const text_element = this.renderer.createText(text);
      this.renderer.appendChild(new_element, text_element);
    }
    this.renderer.appendChild(parent, new_element);
    this.renderer.setAttribute(new_element, 'contenteditable', 'true')
    this.renderer.listen(new_element, 'keypress', this.keypress_decorator(new_element));
    this.renderer.listen(new_element, 'click', this.click_decorator(new_element));
    // this.renderer.listen(new_element, 'focus', this.focus_decorator(new_element));
    new_element.focus()
    return new_element;
  }
}
