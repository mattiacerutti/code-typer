
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
   AutoClosing = "autoclosing"
}

export interface BaseCharacter {
	type: CharacterTypes;
	value: string | WhitespaceTypes;
   state: CharacterState;
}

export interface NormalCharacter extends BaseCharacter {
	type: CharacterTypes.Normal;
	value: string;
}

export interface AutoClosingCharacter extends BaseCharacter {
	type: CharacterTypes.AutoClosing;
	value: string;
}

export interface WhitespaceCharacter extends BaseCharacter {
	type: CharacterTypes.Whitespace;
	value: WhitespaceTypes;
}

export interface EOFCharacter extends BaseCharacter {
	type: CharacterTypes.EOF;
	value: "EOF";
}


export type Character = NormalCharacter | WhitespaceCharacter | EOFCharacter | AutoClosingCharacter;