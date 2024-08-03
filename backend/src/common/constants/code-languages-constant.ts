import { ICodeLanguage, LanguageName } from '@/types/CodeLanguage';

export const SUPPORTED_LANGUAGES: Record<LanguageName, ICodeLanguage> = {
  [LanguageName.JavaScript]: {
    name: LanguageName.JavaScript,
    extensions: ['js', 'jsx'],
    highlightAlias: 'javascript',
  },
  [LanguageName.TypeScript]: {
    name: LanguageName.TypeScript,
    extensions: ['ts', 'tsx'],
    highlightAlias: 'typescript',
  },
  [LanguageName.C]: {
    name: LanguageName.C,
    extensions: ['c'],
    highlightAlias: 'cpp',
  },
  [LanguageName.Cpp]: {
    name: LanguageName.Cpp,
    extensions: ['cpp'],
    highlightAlias: 'cpp',
  },
  [LanguageName.CSharp]: {
    name: LanguageName.CSharp,
    extensions: ['cs'],
    highlightAlias: 'csharp',
  },
  [LanguageName.Java]: {
    name: LanguageName.Java,
    extensions: ['java'],
    highlightAlias: 'java',
  },
  [LanguageName.Python]: {
    name: LanguageName.Python,
    extensions: ['py'],
    highlightAlias: 'python',
  },
  [LanguageName.Lua]: {
    name: LanguageName.Lua,
    extensions: ['lua'],
    highlightAlias: 'lua',
  },
};
