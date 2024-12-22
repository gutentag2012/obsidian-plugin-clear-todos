import {Editor, EventRef, MarkdownView, Plugin, TAbstractFile, TFile} from 'obsidian';

const DONE_TODO_REGEX = /(^|\n)\t*- \[x\].*?(?=\n|$)/g;
const TODO_TEXTS = {
	clearSelection: "Clear todos in selection or current file",
	clearFile: "Clear todos in file"
}
const CLEAR_TODO_ICON = "check-check"
const CLEAR_COMMAND_ID = "clear-todos"

export default class ClearTodosPlugin extends Plugin {
	private editorMenuEvent: EventRef;
	private fileMenuEvent: EventRef;

	async onload() {
		this.addCommand({
			id: CLEAR_COMMAND_ID,
			name: TODO_TEXTS.clearSelection,
			editorCallback: (_editor: Editor, view: MarkdownView) => {
				this.clearTodosInView(view)
			},
			icon: CLEAR_TODO_ICON
		});

		this.editorMenuEvent = this.app.workspace.on("editor-menu", (menu) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView)
			if(!view) {
				console.error("Clear Todos: No active MarkdownView found")
				return
			}
			menu.addItem((item) =>
				item
					.setTitle(TODO_TEXTS.clearSelection)
					.setIcon(CLEAR_TODO_ICON)
					.onClick(() => this.clearTodosInView(view))
			)
		})
		this.fileMenuEvent = this.app.workspace.on("file-menu", (menu, file) => {
			menu.addItem((item) =>
				item
					.setTitle(TODO_TEXTS.clearFile)
					.setIcon(CLEAR_TODO_ICON)
					.onClick(() => this.clearTodosForFile(file))
			)
		})
	}

	onunload() {
		super.onunload();
		this.removeCommand(CLEAR_COMMAND_ID);
		this.app.workspace.offref(this.editorMenuEvent);
		this.app.workspace.offref(this.fileMenuEvent);
	}

	private async clearTodosForFile(file: TAbstractFile) {
		if(!(file instanceof TFile)) return
		const fileContent = await file.vault.read(file)
		await file.vault.modify(file, this.clearTodoString(fileContent))
	}

	private clearTodosInView(view: MarkdownView) {
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
