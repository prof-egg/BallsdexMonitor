import { Events } from "discord.js"
import { IEventFunc } from "../lib/handlers/file-handlers/EventHandler.js"
import Debug from "../lib/util/Debug.js"
import messageConfig from "../config/messages.json" assert { type: "json" }
import clientconfig from "../config/client.json" assert { type: "json" }
import FHH from "../lib/handlers/HandlerHub.js"
import { SpawnManager } from "../lib/handlers/countryballs/SpawnHandler.js"

const eventType = Events.MessageCreate

const eventFunction: IEventFunc<typeof eventType> = async (client, loggerID, message) => {
    
    if (SpawnManager.monitorActive) {
        // Handle messages (copied from countryballs/cog.py)
        if (message.author.bot)
            return
        let guild = message.guild
        if (!guild) return
        // Guild cache and blacklist not setup
        //if guild.id not in self.spawn_manager.cache:
        //    return
        //if guild.id in self.bot.blacklist_guild:
        //    return
        SpawnManager.handleMessage(message)
    } else {
        // Look for activating monitor
        if (!message.author.bot)
            return
        let guild = message.guild
        if (!guild) return
        // Check for ballsdex id
        if (message.author.id != "999736048596816014")
            return
        // Check for ballsdex channelID
        if (message.channelId != "1250283378222039070")
            return
        if (message.content != "A wild countryball appeared!")
            return
    
        // Slightly off, real bot uses the message just before the spawn message
        // Also need a script to get the last 100 messages and fill message cache
        SpawnManager.getGuildSpawnCooldown(guild.id)?.reset(message.createdAt)
        SpawnManager.monitorActive = true
    }
}

const eventData = {
    event: eventType,
    once: false
}

export { eventFunction, eventData }