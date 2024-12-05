import {Editor, MarkdownView, Plugin, WorkspaceLeaf, setIcon} from 'obsidian';

const DONE_TODO_REGEX = /(^|\n)\t*- \[x\].*?(?=\n|$)/g;

export default class ClearTodosPlugin extends Plugin {
	async onload() {
		this.addCommand({
			id: 'clear-todos',
			name: 'Clear in selection or current file',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const selection = editor.getSelection();
				if (selection) {
					editor.replaceSelection(selection.replace(DONE_TODO_REGEX, ''));
					return
				}
				view.setViewData(view.data.replace(DONE_TODO_REGEX, ''), false);
			}
		});

		this.app.workspace.onLayoutReady(() => {
			const explorers = this.getFileExplorers();
			explorers.forEach((exp) => {
				this.addClearButton(exp);
			});
		});
	}

	async onunload() {
		const explorers = this.getFileExplorers();
		explorers.forEach((exp) => {
			const button = this.getRevealButton(exp);
			if (button) {
				button.remove();
			}
		});
	}

	/**
	 * Adds the reveal button to a file explorer leaf.
	 * Returns the newly created button element or the old one if already there.
	 */
	private addClearButton(explorer: WorkspaceLeaf): void {
		const container = explorer.view.containerEl as HTMLDivElement;
		const navContainer = container.querySelector('div.nav-buttons-container') as HTMLDivElement;
		if (!navContainer) {
			console.error("Clear Todos: Could not locate File NavBar!")
			return;
		}

		const existingButton = this.getRevealButton(explorer);
		if (existingButton) {
			return;
		}

		const newIcon = document.createElement('div');
		this.setButtonProperties(newIcon);
		newIcon.className = 'clickable-icon nav-action-button clear-todos-button';
		this.registerDomEvent(newIcon, 'click', () => {
			this.onButtonClick(explorer);
		});
		navContainer.appendChild(newIcon);
	}

	private setButtonProperties(button: HTMLElement): void {
		setIcon(button, 'sweep');
		button.setAttribute(
			'aria-label',
			'Clear completed todos'
		);
	}

	private getFileExplorers(): WorkspaceLeaf[] {
		return this.app.workspace.getLeavesOfType('file-explorer');
	}

	private getRevealButton(explorer: WorkspaceLeaf): HTMLDivElement | null {
		return explorer.view.containerEl.querySelector(
			'.clear-todos-button'
		);
	}

	private onButtonClick(explorer: WorkspaceLeaf): void {
		if (explorer) {
			// @ts-ignore https://forum.obsidian.md/t/is-using-app-commands-executecommandbyid-officially-supported/77454
			this.app.commands.executeCommandById('clear-todos:clear-todos');
		}
	}
}
