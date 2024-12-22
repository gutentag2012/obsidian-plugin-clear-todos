import {Editor, EventRef, MarkdownView, Menu, Plugin, TAbstractFile, TFile} from 'obsidian';

const DONE_TODO_REGEX = /(^|\n)\t*- \[x\].*?(?=\n|$)/g;

export default class ClearTodosPlugin extends Plugin {
	private editorMenuEvent: EventRef;
	private fileMenuEvent: EventRef;

	async onload() {
		this.addCommand({
			id: 'clear-todos',
			name: 'Clear in selection or current files',
			editorCallback: (_editor: Editor, view: MarkdownView) => {
				this.clearTodosOnView(view)
			},
			icon: "check-check"
		});

		this.editorMenuEvent = this.app.workspace.on("editor-menu", (menu) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView)
			if(!view) {
				console.error("Clear Todos: No active MarkdownView found")
				return
			}
			menu.addItem((item) =>
				item
					.setTitle("Clear in selection or current file")
					.setIcon("check-check")
					.onClick(async () => {
						this.clearTodosOnView(view)
					})
			)
		})
		this.fileMenuEvent = this.app.workspace.on("file-menu", (menu, file) => {
			menu.addItem((item) =>
				item
					.setTitle("Clear Todos in file")
					.setIcon("check-check")
					.onClick(async () => {
						await this.clearTodosForFile(file)
					})
			)
		})
	}

	onunload() {
		super.onunload();
		this.removeCommand('clear-todos');
		this.app.workspace.offref(this.editorMenuEvent);
		this.app.workspace.offref(this.fileMenuEvent);
	}

	private async clearTodosForFile(file: TAbstractFile) {
		if(!(file instanceof TFile)) return
		const fileContent = await file.vault.read(file)
		await file.vault.modify(file, this.clearTodoString(fileContent))
	}

	private clearTodosOnView(view: MarkdownView) {
		const selection = view.editor?.getSelection();
		if (selection) {
			return view.editor.replaceSelection(this.clearTodoString(selection))
		}
		return view.setViewData(this.clearTodoString(view.data), false)
	}

	private clearTodoString(todoString: string) {
		return todoString.replace(DONE_TODO_REGEX, "")
	}
}
