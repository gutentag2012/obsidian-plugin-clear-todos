import { expect, test } from "vitest";
import { clearTodo, moveTodoDown } from "../lib";
test("A single completed TODO should be removed", () => {
	expect(clearTodo("- [x] test")).toBe("");
});

test("Text not containing closed TODOs should remain unchanged", () => {
	expect(moveTodoDown("asdfasdf")).toBe("asdfasdf");
});

test("A single completed TODO should remain unchanged", () => {
	expect(moveTodoDown("- [x] yup")).toBe("- [x] yup");
});

test("A completed TODO should be placed below the rest", () => {
	expect(moveTodoDown("- [x] completed\nsome other things")).toBe(
		"some other things\n- [x] completed",
	);
});

test("a scrapped TODO should be placed below the rest", () => {
	expect(moveTodoDown("- [-] scrapped\nsome other things")).toBe(
		"some other things\n- [-] scrapped",
	);
})

test("a scrapped TODO should be placed below completed TODO, below the rest", () => {
	expect(moveTodoDown("- [-] scrapped\n- [x] completed\nsome other things")).toBe(
		"some other things\n- [x] completed\n- [-] scrapped",
	);
})

test("two non TODO texts should be separated by a line break after TODOs between them have been extracted", () => {
	expect(moveTodoDown("some things\n- [x] completed\nsome other things")).toBe(
		"some things\nsome other things\n- [x] completed",
	);
})
