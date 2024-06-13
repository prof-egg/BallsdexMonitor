import { Events } from "discord.js"
import { IEventFunc } from "../lib/handlers/file-handlers/EventHandler.js"
import Debug from "../lib/util/Debug.js"
import messageConfig from "../config/messages.json" assert { type: "json" }
import clientconfig from "../config/client.json" assert { type: "json" }
import FHH from "../lib/handlers/HandlerHub.js"

const eventType = Events.ClientReady

const eventFunction: IEventFunc<typeof eventType> = async (client, loggerID, readyClient) => {
    FHH.CommandHandler.cacheData(readyClient)
    await FHH.CommandHandler.loadSlashCommandFolder("dist/commands")
    readyClient.user.setActivity(messageConfig.clientPresence);
    Debug.logImportant(`${clientconfig.name} is online!`, loggerID)
}

const eventData = {
    event: eventType,
    once: true
}

export { eventFunction, eventData }