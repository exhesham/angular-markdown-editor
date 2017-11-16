import { browser, by, element } from 'protractor';

export class MarkdownEditorPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-toolbar h1')).getText();
  }
}
