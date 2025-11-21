import {useRef, useState} from "react";
import {api} from "@/components/providers/trpc-provider";
import {useGameStore} from "@/features/game/state/game-store";
import {GameStatus} from "@/features/game/types/game-status";
import {REFRESH_BUTTON_MIN_DELAY} from "@/features/game/config/game";
import {ILanguage} from "@/features/shared/types/language";
import {IClientSnippet} from "@/features/shared/types/snippet";
import useSettingsStore from "@/features/settings/stores/settings-store";
import {AutoClosingMode} from "@/features/settings/types/autoclosing-mode";
import {buildClientSnippets} from "@/features/snippets/services/build-client-snippets.client";

export function useGameSnippets() {
  const language = useGameStore((state) => state.language);
  const initialize = useGameStore((state) => state.initialize);
  const addSnippetsToQueue = useGameStore((state) => state.addSnippetsToQueue);
  const goToNextSnippet = useGameStore((state) => state.goToNextSnippet);
  const setStatus = useGameStore((state) => state.setStatus);
  const getSnippetQueue = useGameStore((state) => state.getSnippetQueue);

  const setSelectedLanguage = useSettingsStore((state) => state.setSelectedLanguage);
  const autoClosingMode = useSettingsStore((state) => state.autoClosingMode);

  const [isNextButtonLocked, setIsNextButtonLocked] = useState(false);
  const backgroundFetchPromise = useRef<Promise<void> | null>(null);

  const {data: availableLanguages, isError: languagesError} = api.snippet.languages.useQuery();
  const {error: randomError, ...fetchRandomSnippets} = api.snippet.random.useMutation();
  const {error: byIdError, ...fetchSnippetById} = api.snippet.byId.useMutation();

  const error = languagesError || randomError || byIdError;

  const fetchSnippetsForLanguage = async (language: ILanguage): Promise<IClientSnippet[]> => {
    const autoClosingEnabled = autoClosingMode !== AutoClosingMode.DISABLED;
    const rawSnippets = await fetchRandomSnippets.mutateAsync({languageId: language.id});
    return buildClientSnippets(rawSnippets, autoClosingEnabled);
  };

  const refillSnippetQueue = async (language: ILanguage) => {
    const snippets = await fetchSnippetsForLanguage(language);
    addSnippetsToQueue(snippets);
  };

  const activateLanguage = async (language: ILanguage) => {
    setSelectedLanguage(language);
    const snippets = await fetchSnippetsForLanguage(language);
    initialize(language, snippets);
  };

  const activateLanguageWithSnippet = async (snippetId: string) => {
    const snippet = await fetchSnippetById.mutateAsync({snippetId});
    const language = availableLanguages![snippet.languageId];
    const snippetsQueue = await fetchRandomSnippets.mutateAsync({languageId: language.id});

    const rawSnippets = [snippet, ...snippetsQueue.filter((s) => s.id !== snippet.id)];
    const snippets = buildClientSnippets(rawSnippets, autoClosingMode !== AutoClosingMode.DISABLED);

    initialize(language, snippets);
  };

  const changeSnippet = async () => {
    const snippetQueue = getSnippetQueue();

    const startTime = Date.now();
    setIsNextButtonLocked(true);

    if (snippetQueue.length === 0) {
      setStatus(GameStatus.LOADING);

      if (backgroundFetchPromise.current) {
        await backgroundFetchPromise.current;
      } else if (language) {
        await activateLanguage(language);
        setIsNextButtonLocked(false);
        return;
      }
    } else if (snippetQueue.length <= 3 && !backgroundFetchPromise.current) {
      backgroundFetchPromise.current = refillSnippetQueue(language!).finally(() => {
        backgroundFetchPromise.current = null;
      });
    }

    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(REFRESH_BUTTON_MIN_DELAY - elapsedTime, 0);

    goToNextSnippet();

    setTimeout(() => {
      setIsNextButtonLocked(false);
    }, remainingTime);
  };

  return {
    availableLanguages,
    activateLanguage,
    activateLanguageWithSnippet,
    changeSnippet,
    error,
    isNextButtonLocked,
  };
}
