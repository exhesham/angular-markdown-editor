import { MarkdownEditorPage } from './app.po';

describe('markdown-editor App', () => {
  let page: MarkdownEditorPage;

  beforeEach(() => {
    page = new MarkdownEditorPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
