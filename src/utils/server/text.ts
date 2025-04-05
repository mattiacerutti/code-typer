export function countInitialWhitespaces(text: string): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== " " && text[i] !== "\t") {
      break;
    }

    count++;
  }
  return count;
}

export function removeInitialCharacters(lines: string[], quantity: number): string[] {
  if (quantity < 1) return lines;

  const newLines: string[] = [];

  lines.forEach((line) => {
    newLines.push(line.slice(quantity));
  });

  return newLines;
}


