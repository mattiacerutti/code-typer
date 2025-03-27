import { ILanguage } from "@/types/language";

export enum Languages {
  JAVASCRIPT = 'JavaScript',
  TYPESCRIPT = 'TypeScript',
  C = 'C',
  CPP = 'C++',
  CSHARP = 'C#',
  JAVA = 'Java',
  PYTHON = 'Python',
  LUA = 'Lua',
}


export const SUPPORTED_LANGUAGES: Record<Languages, ILanguage> = {
  [Languages.JAVASCRIPT]: {
    name: Languages.JAVASCRIPT,
    extensions: ['js', 'jsx'],
    highlightAlias: 'javascript',
  },
  [Languages.TYPESCRIPT]: {
    name: Languages.TYPESCRIPT,
    extensions: ['ts', 'tsx'],
    highlightAlias: 'typescript',
  },
  [Languages.C]: {
    name: Languages.C,
    extensions: ['c'],
    highlightAlias: 'cpp',
  },
  [Languages.CPP]: {
    name: Languages.CPP,
    extensions: ['cpp'],
    highlightAlias: 'cpp',
  },
  [Languages.CSHARP]: {
    name: Languages.CSHARP,
    extensions: ['cs'],
    highlightAlias: 'csharp',
  },
  [Languages.JAVA]: {
    name: Languages.JAVA,
    extensions: ['java'],
    highlightAlias: 'java',
  },
  [Languages.PYTHON]: {
    name: Languages.PYTHON,
    extensions: ['py'],
    highlightAlias: 'python',
  },
  [Languages.LUA]: {
    name: Languages.LUA,
    extensions: ['lua'],
    highlightAlias: 'lua',
  },
};
