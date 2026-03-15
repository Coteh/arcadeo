import { IGameState, IGamePreferences, IGamePersistentState } from "../game";

export interface IGameStorage {
    saveGame: (gameState: IGameState) => void;
    savePersistentState: (persistentState: IGamePersistentState) => void;
    savePreferences: (preferences: IGamePreferences) => void;
    gameExists: () => boolean;
    persistentStateExists: () => boolean;
    preferencesExists: () => boolean;
    loadGame: () => IGameState;
    loadPersistentState: () => IGamePersistentState;
    loadPreferences: () => IGamePreferences;
    clearGame: () => void;
    clearPersistentState: () => void;
    clearPreferences: () => void;
}
