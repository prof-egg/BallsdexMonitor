import { Events } from "discord.js"
import { IEventFunc } from "../lib/handlers/file-handlers/EventHandler.js"
import Debug from "../lib/util/Debug.js"
import messageConfig from "../config/messages.json" assert { type: "json" }
import clientconfig from "../config/client.json" assert { type: "json" }
import FHH from "../lib/handlers/HandlerHub.js"
import { SpawnManager } from "../lib/handlers/countryballs/SpawnHandler.js"

const eventType = Events.ClientReady

const eventFunction: IEventFunc<typeof eventType> = async (client, loggerID, readyClient) => {

    // Do command handling
    FHH.CommandHandler.cacheData(readyClient)
    await FHH.CommandHandler.loadSlashCommandFolder("dist/commands")

    // Fill spawncooldown message cache for guild
    let homeGuild = await client.guilds.fetch(clientconfig.homeGuild.id)
    let msg = await SpawnManager.getLatestBallSpawn(homeGuild)
    if (msg) {
        SpawnManager.ensureGuildCooldown(homeGuild, msg)
        let cooldown = SpawnManager.getGuildSpawnCooldown(clientconfig.homeGuild.id)
        await cooldown?.resetMessageCache(homeGuild, msg) 
        SpawnManager.monitorActive = true
    } else {
        Debug.logWarning("Unable to activate monitor", "ReadyEvent")
    }
    
    // Set presence
    readyClient.user.setActivity(messageConfig.clientPresence);
    Debug.logImportant(`${clientconfig.name} is online!`, loggerID)
}

const eventData = {
    event: eventType,
    once: true
}

export { eventFunction, eventData }