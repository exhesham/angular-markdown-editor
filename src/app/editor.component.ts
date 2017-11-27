/**
 * Created by hishamy on 16/11/2017.
 */
import * as showdowntools from 'showdown';
import {
    AfterViewInit, Component, ElementRef, Renderer2, ViewChild, Inject,
    ViewContainerRef, Output, EventEmitter
} from '@angular/core';
//import {DialogLinkEdit} from "./dialog-link/link.component";
import {ColorPallateComponent} from "./color-pallate/color.pallate.component";
import { MarkdownToHtmlModule } from 'ng2-markdown-to-html';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSelectChange} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {isNullOrUndefined} from "util";
import {DialogAbout} from "./dialog-about/dialog.about.component";
import {DialogSaveComponent} from "./dialog-save/dialog.save.component";
interface MSBaseReader { result: any; }
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
    public  markdown: any;
    public markdown_input_file: any;
    public reader: any;

    @ViewChild('richtextbox', {read: ViewContainerRef}) richtextbox: ViewContainerRef;
    @ViewChild('p_dom') p_dom;
    @ViewChild('fileInput') fileInput:ElementRef;

    @ViewChild('edit')
    public edit: ElementRef;


    private main_div: any;
    private tags_need_custom_removal = ['blockquote','code', 'pre'];

    constructor(private renderer: Renderer2, public dialog: MatDialog) {
    }

    ngAfterViewInit(): void {
        this.renderer.parentNode(this.richtextbox)
        this.main_div = this.inject_new_element(ElementType.p, 'I am a text', this.edit.nativeElement);

        let default_ui = '<h1 id="welcometothemarkdowneditor">Welcome to the markdown Editor!!!!!</h1>\n' +
            '<p>If you save the file, you will get this page in MARKDOWN format!</p>\n' +
            '<p><strong>Feel free to open an issue or suggest a feature by pressing the button!</strong></p>\n' +
            '<p><img src="http://nmrwiki.org/wiki/images/7/7d/Bug.png" alt="" /></p>\n' +
            '<p>Dont forget to clean this mess by pressing the Trash bin button.\n' +
            ' <img src="https://www.google.co.il/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwi6r56kv9_XAhUIb1AKHfNqBfMQjRwIBw&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fbug-report-button_61019&psig=AOvVaw1PxFAA79s6quupY4wtwTQm&ust=1511897513705432" alt="" /></p>';
        this.main_div.innerHTML= default_ui;
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
            console.log(this.edit.nativeElement.getBoundingClientRect())

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
        this.main_div.focus();
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
        this.main_div.focus();
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

    private get_node_tag(node){
        return isNullOrUndefined(node.tagName)? '': node.tagName.toLowerCase();
    }
    private parse_html_to_markdown(node, attr=1){
        let res = ''
        let nodes = node.childNodes;
        // let parent_node_tag = isNullOrUndefined(node.tagName)?node.parentElement.tagName.toLowerCase():node.tagName.toLowerCase()
        let parent_node_tag = this.get_node_tag(node)

        if ( nodes.length == 0){
            console.log('NO Children for the node ', node, ' with tag:', node.tagName);
            let node_attr =  node.attributes
            return this.get_markdown_syntax(node.textContent, parent_node_tag ,node_attr, node);
        }else{
            for(let i = 0;i < nodes.length;i++){
                // let child_tag_name =isNullOrUndefined(nodes[i].tagName)?nodes[i].parentElement.tagName.toLowerCase():nodes[i].tagName.toLowerCase()
                let child_tag_name = this.get_node_tag(nodes[i]);
                if(child_tag_name == 'ol' ){
                    console.log('Handling  ol: ', nodes[i])
                    for(let j = 0;j < nodes[i].childNodes.length;j++){      // go over all the li of the ol
                        console.log('Handling li # ',attr, ' of ol')
                        res = res + attr + '- ' + this.parse_html_to_markdown(nodes[i].childNodes[j], attr+1)+ '\n';
                    }
                    continue;
                }
                if(child_tag_name == 'ul' ){
                    console.log('Handling  ul: ', nodes[i])
                    for(let j = 0;j < nodes[i].childNodes.length;j++){
                        if(!isNullOrUndefined(nodes[i].childNodes[j].tagName) && nodes[i].childNodes[j].tagName.toLowerCase() == 'li'){
                            res = res + ' * ' + this.parse_html_to_markdown(nodes[i].childNodes[j])+ '\n';
                        }
                    }
                    continue;
                }
                if(child_tag_name == 'table'){
                    console.log('Handling  table: ', nodes[i])
                    for(let j=0;j< nodes[i].childNodes.length;j++){ // there should be tbody as a child of table
                        if(nodes[i].childNodes[j].tagName && nodes[i].childNodes[j].tagName.toLowerCase() == 'tbody'){
                            let rows = nodes[i].childNodes[j].childNodes;
                            let table_md = ''
                            for(let r=0;r< rows.length;r++){ //scan the rows
                                let cols = rows[r].childNodes;
                                let row_md = '\n|'
                                for(let c=0;c< cols.length;c++){//scan the  columns
                                    let cell_content = this.parse_html_to_markdown(cols[c], attr)
                                    row_md = row_md + cell_content + '|'
                                }
                                table_md+=row_md
                                if(r == 0){
                                    let split_attr = '\n|'
                                    for(let c=0;c< cols.length;c++){// add the attributes underline
                                        split_attr  = split_attr + '---|'
                                    }
                                    table_md+=split_attr
                                }
                            }
                            res = res + table_md + '\n'
                        }
                    }
                    continue;
                }
                console.log('Handling  ', child_tag_name,': ', nodes[i])
                let node_attr =  nodes[i].attributes
                let inside_content = this.parse_html_to_markdown(nodes[i]);
                res = res + this.get_markdown_syntax(inside_content, child_tag_name,node_attr, nodes[i]);
            }
            return res
        }
    }

    private get_markdown_syntax(text_content: string, tag_name: string, attr: NamedNodeMap|any, node) {

        let nodes;
        let res;
        let ul_prefix = false;
        console.log('tag_name=',tag_name, 'node=',node, 'attr=',attr)
        if( tag_name == 'b'){
            return '**' + text_content + '**'
        }
        if( tag_name == 'pre'){
            return '\n```' + text_content + '```\n'
        }
        if( tag_name == 'i'){
            return '_' + text_content + '_'
        }
        if( tag_name == 'u'){
            return '' + text_content + ''
        }
        if( tag_name == 'h1'){
            return '# ' + text_content
        }
        if( tag_name == 'h2'){
            return '## ' + text_content
        }
        if( tag_name == 'h3'){
            return '### ' + text_content
        }
        if( tag_name == 'h4'){
            return '#### ' + text_content
        }
        if( tag_name == 'h5'){
            return '##### ' + text_content
        }
        if( tag_name == 'h6'){
            return '###### ' + text_content

        }
        if( tag_name == 'a'){
            let link = ''
            console.log('link attr:', attr)
            if(!isNullOrUndefined(attr) && !isNullOrUndefined(attr.getNamedItem('href'))){
                link = attr.getNamedItem('href').value;
            }
            return '[' + text_content + '](' + link + ')'
        }
        if( tag_name == 'img'){
            console.log('image is received')
            let src = ''
            let alt = ''
            console.log('image has source:', attr)
            if(!isNullOrUndefined(attr) && !isNullOrUndefined(attr.getNamedItem('src'))){
                console.log('image has source')
                src = attr.getNamedItem('src').value;
            }
            if(!isNullOrUndefined(attr) && !isNullOrUndefined(attr.getNamedItem('alt'))){
                alt = attr.getNamedItem('alt').value;
            }
            return '![' + alt + '](' + src + ')'
        }
        if( tag_name == 'code'){
            return 'js\n' + text_content
        }
        if( tag_name == 'blockquote'){
            return '> ' + text_content + '\n'
        }
        if( tag_name == 'hr'){
            return '---' + '\n'
        }
        if( tag_name == 'br'){

            return '\n'
        }
        if( tag_name == 'div'){
            console.log('attr=',attr)
            if(attr && !isNullOrUndefined(attr.getNamedItem('style'))){
                console.log(attr.getNamedItem('style'))
                let style_align_type = attr.getNamedItem('style').value.toLowerCase();
                if(style_align_type.indexOf('text-align: justify')>=0){
                    style_align_type ='justify'
                }
                if(style_align_type.indexOf('text-align: left')>=0){
                    style_align_type ='left'
                }
                if(style_align_type.indexOf('text-align: right')>=0){
                    style_align_type ='right'
                }
                if(style_align_type.indexOf('text-align: center')>=0){
                    style_align_type ='center'
                }

                return '\n' +`<${style_align_type}>${text_content }</${style_align_type}>`
            }
            return '\n' + text_content ;
        }
        if( tag_name == 'p'){
            return '\n' + text_content
        }
        if( tag_name == 'del' || tag_name == 'strike'){
            return '~~' + text_content + '~~'
        }
        // if( tag_name == 'ul' || tag_name == 'ol'){
        //     res = ''
        //     let prefix = tag_name == 'ul'? ' ..*' : attr + '- '
        //     console.log('ul,ol node=', node)
        //     let node_parsed = this.parse_html_to_markdown(node);
        //     res += node_parsed.length >0? prefix + node_parsed + '\n' :''
        //
        //     return res
        // }

        return text_content
    }

    save_and_download(){
        let dialogRef = this.dialog.open(DialogSaveComponent, {
            data: { save_as_name: 'README.md' }
        });
        dialogRef.afterClosed().subscribe(result => {

            if(isNullOrUndefined(result)){
                return; // the user cancelled the saving
            }

            let file_content = this.parse_html_to_markdown(this.main_div);
            var data, link;

            if (file_content == null) return;

            let save_as_name = result;

            if (!file_content.match(/^data:text\/md/i)) {
                file_content = 'data:text/csv;charset=utf-8,' + file_content;
            }
            data = encodeURI(file_content);

            link = document.createElement('a');
            link.setAttribute('href', data);
            link.setAttribute('download', save_as_name);
            link.click();
        });
    }

    about(){
        let dialogRef = this.dialog.open(DialogAbout, {

        });
        dialogRef.afterClosed().subscribe(result => {
        });
    }
    clean(){
        this.main_div.innerHTML= ''
        this.main_div.focus();
    }
    public open_file(event){
        var files: File[] = event.srcElement.files;

        this.markdown_input_file = files[0];

        this.reader = new FileReader();
        let callback = (e:any) => {
            this.markdown = this.reader.result;
            var converter = new showdowntools.Converter()
            let html = converter.makeHtml(this.markdown);
            console.log('setting html', html)
            this.main_div.innerHTML= html

        }

        this.reader.onloadend = callback

        this.reader.readAsText(files[0]);

    }

}
