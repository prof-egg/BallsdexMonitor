import * as dotenv from "dotenv";
import FHH from "../lib/handlers/HandlerHub.js";

// NOTE: See scripts/keepAlive.ts for layout info

export function refreshCommands(): Promise<void> {
    return new Promise(async (resolve) => {
        dotenv.config();
        await FHH.CommandHandler.loadSlashCommandFolder("dist/commands")
        await FHH.CommandHandler.refreshSlashCommandRegistry(process.env.CLIENT_LOGIN_TOKEN, true)
        resolve()
    })
}

export function loadRefreshCommands(){}

refreshCommands()