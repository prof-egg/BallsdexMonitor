import { Events } from "discord.js"
import { IEventFunc } from "../lib/handlers/file-handlers/EventHandler.js"
import { SpawnManager } from "../lib/handlers/countryballs/SpawnHandler.js"

const loggerID = "MessageHandler"
const eventType = Events.MessageCreate

const eventFunction: IEventFunc<typeof eventType> = async (client, loggerID, message) => {

    let guild = message.guild
    if (!guild) return

    if (SpawnManager.monitorActive) {
        // Handle messages (copied from countryballs/cog.py)
        if (message.author.bot)
            return
        // Guild cache and blacklist not setup
        //if guild.id not in self.spawn_manager.cache:
        //    return
        //if guild.id in self.bot.blacklist_guild:
        //    return
        SpawnManager.handleMessage(message)
    } else {

        let ballsdexID = "999736048596816014"
        let channelID = "1250283378222039070"
        let msg = "A wild countryball appeared!"

        // Debug.log(`NEW MESSAGE: ${message.author.username}: "${message.content}"`, loggerID)
        // Debug.log(`Author is bot: ${message.author.bot}`, loggerID)
        // Debug.log(`Author has ballsdex id: ${message.author.id == ballsdexID}`, loggerID)
        // Debug.log(`Message is in channel: ${message.channelId == channelID}`, loggerID)
        // Debug.log(`Message contains balls msg: ${message.content.includes(msg)}`, loggerID)

        // Look for activating monitor
        if (!message.author.bot)
            return
        // Check for ballsdex id
        if (message.author.id != ballsdexID)
            return
        // Check for ballsdex channelID
        if (message.channelId != channelID)
            return
        // Check for spawn message
        if (!message.content.includes(msg))
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