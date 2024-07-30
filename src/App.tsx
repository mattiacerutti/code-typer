import GameView from "@/components/GameView";
import { GameStateProvider } from "./contexts/game-state/GameStateProvider";

function App() {
  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col">
      <GameStateProvider>
        <GameView />
      </GameStateProvider>
    </div>
  );
}

export default App;
