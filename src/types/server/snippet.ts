export interface ISnippet {
  content: string;
  disabledRanges: {startIndex: number; endIndex: number}[];
}
