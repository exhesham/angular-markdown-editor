/**
 * Created by hishamy on 16/11/2017.
 */
import {
    AfterViewInit, Component, ElementRef, Renderer2, ViewChild, Inject,
    ViewContainerRef, Output, EventEmitter
} from '@angular/core';
//import {DialogLinkEdit} from "./dialog-link/link.component";
import {ColorPallateComponent} from "./color-pallate/color.pallate.component";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSelectChange} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {isNullOrUndefined} from "util";

export enum ElementType {
    tr,
    td,
    br,
    tbody,
    table,
    p,
    span,
    b,
    italic,
    div,
    blockquote,
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
    private file_name = 'README.md'
    private main_div: any;
    private tags_need_custom_removal = ['blockquote','code', 'pre'];

    constructor(private renderer: Renderer2, public dialog: MatDialog) {
    }

    ngAfterViewInit(): void {
        this.renderer.parentNode(this.richtextbox)
        this.main_div = this.inject_new_element(ElementType.p, 'I am a text', this.edit.nativeElement);
        this.main_div.focus();
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
            for (let i = 0; i < window.getSelection().rangeCount; i++) {
                ranges.push(window.getSelection().getRangeAt(i).commonAncestorContainer)
            }
        } else if (document.getSelection() && document.getSelection().type != "Control") {
            let text = document.createRange();
            ranges.push(text.commonAncestorContainer);
            min = document.getSelection().focusOffset
            max = document.getSelection().anchorOffset

        }
        return text;
    }

    handle_special_keypress(event) {
        if (event.key === 'Enter') {
            if(this.which_tag('blockquote') ){
                console.log('will unquote')
                document.execCommand('InsertParagraph');
                document.execCommand('Outdent');
            }
        }
    }

    apply_command(command_id: string, value: any) {
        //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
        if (!this.executed_custom_tag_removale(command_id, value)) {
            document.execCommand(command_id, true, value);
        }
        this.main_div.focus();
    }

    create_heading(heading_format) {
        document.execCommand("formatBlock", false, heading_format);
    }

    insert_link() {
        console.log('insert link')

        var szURL = prompt("Enter a URL:", "http://");
        if ((szURL != null) && (szURL != "")) {
            document.execCommand("CreateLink", false, szURL);
        }
        this.main_div.focus();
    }

    change_color(color: string) {
        console.log('received color:', color);

        document.execCommand('forecolor', false, color);
        this.main_div.focus();
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
            let table = this.inject_new_element(ElementType.table, null, e)
            table.setAttribute("border", "1");
            table.setAttribute("cellpadding", "2");
            table.setAttribute("cellspacing", "2");
            let tbody = this.inject_new_element(ElementType.tbody, null, table)
            for (var i = 0; i < rows; i++) {
                let tr = this.inject_new_element(ElementType.tr, null, tbody);
                for (var j = 0; j < cols; j++) {
                    let td = this.inject_new_element(ElementType.td, null, tr);
                    let br = this.inject_new_element(ElementType.br, null, td);
                }
            }
            this.insertNodeAtSelection(e, table);
        }
    }
    insert_image(){
        let imagePath = prompt('Enter Image URL:', 'http://');
        if ((imagePath != null) && (imagePath != "")) {
            document.execCommand('InsertImage', false, imagePath);
        }
    }
    insertNodeAtSelection(win, insertNode) {
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
        range = document.createRange();

        if (container.nodeType == 3 && insertNode.nodeType == 3) {

            // if we insert text in a textnode, do optimized insertion
            container.insertData(pos, insertNode.nodeValue);

            // put cursor after inserted text
            range.setEnd(container, pos + insertNode.length);
            range.setStart(container, pos + insertNode.length);

        } else {
            var afterNode;
            if (container.nodeType == 3) {

                // when inserting into a textnode
                // we create 2 new textnodes
                // and put the insertNode in between

                var textNode = container;
                container = textNode.parentNode;
                var text = textNode.nodeValue;

                // text before the split
                var textBefore = text.substr(0, pos);
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

    private inject_new_element(element_type: ElementType, text: string, parent: any) {
        let name = ElementType[element_type];
        if (parent == null){
            parent = this.main_div
        }
        console.log('will inject ', name, ' under ', parent)
        let new_element = this.renderer.createElement(name)
        if (text != null) {
            const text_element = this.renderer.createText(text);
            this.renderer.appendChild(new_element, text_element);
        }
        this.renderer.appendChild(parent, new_element);
        this.renderer.setAttribute(new_element, 'contenteditable', 'true')
        this.renderer.setAttribute(new_element, 'autofocus', 'true')
        // this.renderer.listen(new_element, 'click', this.click_decorator(new_element));
        // this.renderer.listen(new_element, 'focus', this.focus_decorator(new_element));
        new_element.focus()
        return new_element;
    }
    which_tag(tagName){

        var sel, containerNode;
        var tagFound = false;

        tagName = tagName.toUpperCase();

        if (window.getSelection) {

            sel = window.getSelection();

            if (sel.rangeCount > 0) {
                containerNode = sel.getRangeAt(0).commonAncestorContainer;
            }

        }else if( (sel = document.getSelection) && sel.type != "Control" ) {

            containerNode = sel.createRange().parentElement();

        }

        while (containerNode) {

            if (containerNode.nodeType == 1 && containerNode.tagName == tagName) {

                tagFound = true;
                containerNode = null;

            }else{

                containerNode = containerNode.parentNode;

            }

        }

        return tagFound;
    }
    private executed_custom_tag_removale(command_id: string, value: any) {
        console.log('should executed_custom_tag_removale')
        if (command_id == 'formatBlock' && value == 'blockquote' && this.which_tag('blockquote')) {
            console.log('should disable blockquote')
            document.execCommand('Outdent');
            return true
        }
        if (command_id == 'formatBlock' && value == 'pre' && this.which_tag('pre')) {
            console.log('should disable pre')
            this.create_heading('p');
            return true
        }
        return false
    }

    private parse_html_to_markdown(node){
        let res = ''
        let nodes = node.childNodes;
        for(let i = 0;i < nodes.length;i++){
            if(!nodes[i].hasChildNodes()){
                console.log(nodes[i].parentElement)
                res = res + this.get_markdown_syntax(nodes[i].textContent, nodes[i].parentElement.tagName.toLowerCase(),nodes[i].parentElement.attributes)
            }else{
                res = res + this.parse_html_to_markdown(nodes[i]);
            }
        }
        return res

    }

    private get_markdown_syntax(text_content: string, tag_name: string, attr: NamedNodeMap) {
        console.log(tag_name, text_content, attr);
        switch(tag_name){
            case 'b':
            case 'strong':
                return '*' + text_content + '*'
            case 'i':
                return '_' + text_content + '_'
            case 'u':
                return '' + text_content + ''
            case 'h1':
                return '# ' + text_content
            case 'h2':
                return '## ' + text_content
            case 'h3':
                return '### ' + text_content
            case 'h4':
                return '#### ' + text_content
            case 'h5':
                return '##### ' + text_content
            case 'h6':
                return '###### ' + text_content
            case 'a':
                let link = ''
                if(!isNullOrUndefined(attr.getNamedItem('href'))){
                    link = attr.getNamedItem('href').value;
                }
                return '[' + text_content + '](' + link + ')'
            case 'img':
                let src = ''
                if(!isNullOrUndefined(attr.getNamedItem('src'))){
                    src = attr.getNamedItem('src').value;
                }
                return '![' + text_content + '](' + src + ')'
            case 'pre':
                return '`' + text_content + '`'
            case 'code':
                return '\n```' + text_content + '```\n'
            case 'blockquote':
                return '> ' + text_content + '\n'
            case 'hr':
                return '---'
            case 'br':
                return '\n'
            case 'p':
                return text_content
            case 'del':
            case 'strike':
                return '~~' + text_content + '~~'
            case '':
                return '' + text_content + ''
            default:
                return text_content


        }
    }
    save_and_download(){
        let file_content = this.parse_html_to_markdown(this.main_div);
        var data, filename, link;

        if (file_content == null) return;

        filename = this.file_name || 'README.md';

        if (!file_content.match(/^data:text\/md/i)) {
            file_content = 'data:text/csv;charset=utf-8,' + file_content;
        }
        data = encodeURI(file_content);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    }
}
