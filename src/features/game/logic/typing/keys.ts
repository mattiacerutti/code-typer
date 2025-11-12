export function hasModifierKey(event: KeyboardEvent) {
  return event.altKey || event.ctrlKey || event.metaKey || event.key === "Fn" || event.key === "Function";
}

export function isAValidKey(event: KeyboardEvent) {
  const validExtraKeys = ["Enter", "Backspace", "ArrowRight"];
  return event.key.length === 1 || validExtraKeys.includes(event.key);
}

export function isAValidShortcutKey(event: InputEvent) {
  const validShortcutKeys = ["deleteSoftLineBackward", "deleteWordBackward"];
  return validShortcutKeys.includes(event.inputType);
}
