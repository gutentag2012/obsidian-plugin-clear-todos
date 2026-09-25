import {
	Editor,
	EventRef,
	MarkdownView,
	Plugin,
	TAbstractFile,
	TFile,
} from "obsidian";
import { moveTodoDown } from "lib";
import { clearTodo } from "lib";

const TODO_TEXTS = {
	clearSelection: "Clear todos in selection or current file",
	clearFile: "Clear todos in file",
	move: "Move completed TODOs to the bottom",
};
const CLEAR_TODO_ICON = "check-check";
const CLEAR_COMMAND_ID = "clear-todos";
const MOVE_COMMAND_ID = "move-todos";

enum ModificationAction {
	Clear,
	Move,
}

export default class ClearTodosPlugin extends Plugin {
	private actionHandlers: Record<ModificationAction, (s: string) => string> =
		{
			[ModificationAction.Clear]: clearTodo,
			[ModificationAction.Move]: moveTodoDown,
		};

	// Obsidian Boilerplate
	// maps our clearTodo and moveTodoDown functions to various spots in obsidian where we might want them

	private editorMenuEvent: EventRef;
	private fileMenuEvent: EventRef;

	async onload() {
		// Commands (the things mappable to hotkeys)
		this.addCommand({
			id: CLEAR_COMMAND_ID,
			name: TODO_TEXTS.clearSelection,
			editorCallback: (_editor: Editor, view: MarkdownView) => {
				this.modifyTodosInSelectionAndFallBackToFile(
					view,
					ModificationAction.Clear,
				);
			},
			icon: CLEAR_TODO_ICON,
		});
		this.addCommand({
			id: MOVE_COMMAND_ID,
			name: TODO_TEXTS.move,
			editorCallback: (_editor: Editor, view: MarkdownView) => {
				this.modifyTodosInSelectionAndFallBackToFile(
					view,
					ModificationAction.Move,
				);
			},
			icon: CLEAR_TODO_ICON,
		});

		// Editor Menu events (3 dots in the top right)
		this.editorMenuEvent = this.app.workspace.on("editor-menu", (menu) => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) {
				console.error("Clear Todos: No active MarkdownView found"); //todo change to new extension name?
				return;
			}
			menu.addItem((item) =>
				item
					.setTitle(TODO_TEXTS.clearSelection)
					.setIcon(CLEAR_TODO_ICON)
					.onClick(() =>
						this.modifyTodosInSelectionAndFallBackToFile(
							view,
							ModificationAction.Clear,
						),
					),
			);
			menu.addItem((item) =>
				item
					.setTitle(TODO_TEXTS.move)
					.setIcon(CLEAR_TODO_ICON)
					.onClick(() =>
						this.modifyTodosInSelectionAndFallBackToFile(
							view,
							ModificationAction.Move,
						),
					),
			);
		});

		// File Menu Events (right click on file's card)
		this.fileMenuEvent = this.app.workspace.on(
			"file-menu",
			(menu, file) => {
				menu.addItem((item) =>
					item
						.setTitle(TODO_TEXTS.clearFile)
						.setIcon(CLEAR_TODO_ICON)
						.onClick(() =>
							this.modifyTodosForFile(
								file,
								ModificationAction.Clear,
							),
						),
				);
				menu.addItem((item) =>
					item
						.setTitle(TODO_TEXTS.move)
						.setIcon(CLEAR_TODO_ICON)
						.onClick(() =>
							this.modifyTodosForFile(
								file,
								ModificationAction.Move,
							),
						),
				);
			},
		);
	}

	onunload() {
		super.onunload();
		this.removeCommand(CLEAR_COMMAND_ID);
		this.app.workspace.offref(this.editorMenuEvent);
		this.app.workspace.offref(this.fileMenuEvent);
	}

	// used when the modification is requested onto a file from the vault level
	private async modifyTodosForFile(
		file: TAbstractFile,
		action: ModificationAction,
	) {
		if (!(file instanceof TFile)) return;
		const fileContent = await file.vault.read(file);
		await file.vault.modify(file, this.actionHandlers[action](fileContent));
	}

	// used when the modification is requested from within a file and thus could be related to the user selection
	private modifyTodosInSelectionAndFallBackToFile(
		view: MarkdownView,
		action: ModificationAction,
	) {
		const selection: string = view.editor?.getSelection();
		if (selection) {
			return view.editor.replaceSelection(
				this.actionHandlers[action](selection),
			);
		}
		// if there is no selection, we apply the action to the full file (view)
		return view.setViewData(this.actionHandlers[action](view.data), false);
	}
}
