import { Editor, MarkdownView, Plugin } from 'obsidian';

const DONE_TODO_REGEX = /(^|\n)- \[x\].*?(?=\n|$)/g;

export default class ClearTodosPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: 'clear-todos',
			name: 'Clear in selection or current file',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if(selection) {
					editor.replaceSelection(selection.replace(DONE_TODO_REGEX, ''));
					return
				}
				view.setViewData(view.data.replace(DONE_TODO_REGEX, ''), false);
			}
		});
	}
}
