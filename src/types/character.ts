export enum CharacterState {
  Default = "default",
  Right = "right",
  Wrong = "wrong",
}

export enum WhitespaceTypes {
  Space = " ",
  NewLine = "\n",
  Tab = "\t",
}

export enum CharacterTypes {
  Normal = "normal",
  Whitespace = "whitespace",
  EOF = "eof",
  AutoClosing = "autoclosing",
}

export interface IBaseCharacter {
  type: CharacterTypes;
  value: string | WhitespaceTypes;
  state: CharacterState;
}

export interface INormalCharacter extends IBaseCharacter {
  type: CharacterTypes.Normal;
  value: string;
}

export interface IAutoClosingCharacter extends IBaseCharacter {
  type: CharacterTypes.AutoClosing;
  value: string;
}

export interface IWhitespaceCharacter extends IBaseCharacter {
  type: CharacterTypes.Whitespace;
  value: WhitespaceTypes;
}

export interface IEOFCharacter extends IBaseCharacter {
  type: CharacterTypes.EOF;
  value: "EOF";
}

export type ICharacter = INormalCharacter | IWhitespaceCharacter | IEOFCharacter | IAutoClosingCharacter;
export type ISnippet = ICharacter[];
