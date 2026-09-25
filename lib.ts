// the initially provided regex (modified to also hit [-] and not just [x])
// start of file or line break at beginning is also encapsulated
// end of file or line break at end is only required, not encapsulated
const ALL_CLOSED_TODO_REGEX = /(^|\n)\t*- \[(x|-)\].*?(?=\n|$)/g;
// my version, used for the moveTodoDown function
// difference being that there is not requirement for the beginning of the pattern
// and the end of the pattern (line break/end of file) is encapsulated
// this is to ensure that both lines extracted using this regex and the remainder
// still remain in the desired form (line break after each line)
// the only edge case is the very last line which does not have a line break.
// we address this by manually adding before and removing after inside moveTodoDown()
const ALL_CLOSED_TODO_REGEX_WITH_END_LINEBREAK = /\t*- \[(x|-)\].*(\n|$)/g;
const DONE_TODO_REGEX_WITH_END_LINEBREAK = /\t*- \[x\].*(\n|$)/g;
const SCRAPPED_TODO_REGEX_WITH_END_LINEBREAK = /\t*- \[-\].*(\n|$)/g;

export function clearTodo(todoString: string): string {
	return todoString.replace(ALL_CLOSED_TODO_REGEX, "");
}

export function moveTodoDown(rawText: string): string {
	// in case last line has to be moved up (every line keeps the line break at its end)
	rawText += "\n";

	// split to list of lines
	const doneItems = rawText.match(DONE_TODO_REGEX_WITH_END_LINEBREAK);
	const scrappedItems = rawText.match(SCRAPPED_TODO_REGEX_WITH_END_LINEBREAK);
	let output = rawText.replace(ALL_CLOSED_TODO_REGEX_WITH_END_LINEBREAK, "");
	if (doneItems != null) {
		const doneString = doneItems.join("");
		output += doneString;
	}
	if (scrappedItems != null) {
		const scrappedString = scrappedItems.join("");
		output += scrappedString;
	}

	// remove last line's linebreak again (either the one we added or from another line that has been moved down)
	output = output.substring(0, output.length - 1);
	return output;
}
