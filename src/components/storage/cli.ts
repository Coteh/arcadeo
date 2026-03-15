import * as fs from "fs";
import * as path from "path";
import { IGameState, IGamePersistentState, IGamePreferences } from "../game";
import { IGameStorage } from ".";
export const GAME_STATE_JSON_FILENAME = "state.json";
export const PERSISTENT_STATE_JSON_FILENAME = "persistent_state.json";
export const PREFERENCES_JSON_FILENAME = "preferences.json";

export class CLIGameStorage implements IGameStorage {
    saveGame = (gameState: IGameState) => {
        this.saveFile(this.resolvedFilename(GAME_STATE_JSON_FILENAME), gameState);
    };

    savePersistentState = (persistentState: IGamePersistentState) => {
        this.saveFile(this.resolvedFilename(PERSISTENT_STATE_JSON_FILENAME), persistentState);
    };

    savePreferences = (preferences: IGamePreferences) => {
        this.saveFile(this.resolvedFilename(PREFERENCES_JSON_FILENAME), preferences);
    };

    gameExists = () => {
        return this.fileExists(this.resolvedFilename(GAME_STATE_JSON_FILENAME));
    };

    persistentStateExists = () => {
        return this.fileExists(this.resolvedFilename(PERSISTENT_STATE_JSON_FILENAME));
    };

    preferencesExists = () => {
        return this.fileExists(this.resolvedFilename(PREFERENCES_JSON_FILENAME));
    };

    loadGame: () => IGameState = () => {
        return this.loadFile(this.resolvedFilename(GAME_STATE_JSON_FILENAME));
    };

    loadPersistentState: () => IGamePersistentState = () => {
        return this.loadFile(this.resolvedFilename(PERSISTENT_STATE_JSON_FILENAME));
    };

    loadPreferences: () => IGamePreferences = () => {
        return this.loadFile(this.resolvedFilename(PREFERENCES_JSON_FILENAME));
    };

    clearGame = () => {
        this.resetFile(this.resolvedFilename(GAME_STATE_JSON_FILENAME));
    };

    clearPersistentState = () => {
        this.resetFile(this.resolvedFilename(PERSISTENT_STATE_JSON_FILENAME));
    };

    clearPreferences = () => {
        this.resetFile(this.resolvedFilename(PREFERENCES_JSON_FILENAME));
    };

    resolvedFilename = (filename: string) => {
        return path.join(process.cwd(), filename);
    };

    fileExists = (filename: string) => {
        return fs.existsSync(filename);
    };

    saveFile = <T>(filename: string, obj: T) => {
        fs.writeFileSync(filename, JSON.stringify(obj));
    };

    loadFile: <T>(filename: string) => T = (filename) => {
        try {
            const jsonStr = fs.readFileSync(filename);
            // @ts-ignore TODO: Resolve Buffer cannot be assigned to string param type issue
            const json = JSON.parse(jsonStr);
            if (typeof json !== "object") {
                return {};
            }
            return json;
        } catch (e) {
            console.error(`Could not load state from file '${filename}', ${e}`);
            return {};
        }
    };

    resetFile = (filename: string) => {
        fs.writeFileSync(filename, "{}");
    };
}
