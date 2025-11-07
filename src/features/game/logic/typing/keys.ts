export function hasModifierKey(event: KeyboardEvent) {
  return event.altKey || event.ctrlKey || event.metaKey || event.key === "Fn" || event.key === "Function";
}

export function isAValidKey(event: KeyboardEvent) {
  const validExtraKeys = ["Enter", "Backspace", "ArrowRight"];
  return event.key.length === 1 || validExtraKeys.includes(event.key);
}

export function isAValidShortcutKey(event: KeyboardEvent) {
  const validShortcutKeys = ["Backspace"];
  return validShortcutKeys.includes(event.key);
}
