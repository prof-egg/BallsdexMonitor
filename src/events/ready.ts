import { Events } from "discord.js"
import { IEventFunc } from "../lib/handlers/file-handlers/EventHandler.js"
import Debug from "../lib/util/Debug.js"
import messageConfig from "../config/messages.json" assert { type: "json" }
import clientconfig from "../config/client.json" assert { type: "json" }
import FHH from "../lib/handlers/HandlerHub.js"
import { SpawnManager } from "../lib/handlers/countryballs/SpawnHandler.js"
import RarityScraper from "../lib/handlers/countryballs/RarityScraper.js"
import ballsdexConfig from "../config/ballsdex.json" assert { type: "json" }

const eventType = Events.ClientReady
const loggerID = "ReadyEvent"

const eventFunction: IEventFunc<typeof eventType> = async (client, loggerID, readyClient) => {

    // Do command handling
    FHH.CommandHandler.cacheData(readyClient)
    await FHH.CommandHandler.loadSlashCommandFolder("dist/commands")

    // Fill spawncooldown message cache for guild
    for (let i = 0; i < ballsdexConfig.guilds.length; i++) {
        Debug.log(`Setting up server ${i + 1}...`)
        // Get guild obj from id
        try {
            var guild = await client.guilds.fetch(ballsdexConfig.guilds[i].guildID)
        } catch{
            Debug.log(`Not in server, aborting...`)
            continue
        }

        // Look for message ball spawn
        let msg = await SpawnManager.getLatestBallSpawn(guild)
        // Setup bot
        if (msg) {
            SpawnManager.ensureGuildCooldown(guild, msg)
            let cooldown = SpawnManager.getGuildSpawnCooldown(clientconfig.homeGuild.id)
            await cooldown?.resetMessageCache(guild, msg) 
            SpawnManager.monitorActive = true
        } else {
            Debug.logWarning("Unable to activate monitor", "ReadyEvent")
        }
    }
    
    // Load rarities for rarity raw wiki
    await RarityScraper.loadRarities()

    // Set presence
    readyClient.user.setActivity(messageConfig.clientPresence);
    Debug.logImportant(`${clientconfig.name} is online!`, loggerID)
}

const eventData = {
    event: eventType,
    once: true
}

export { eventFunction, eventData }