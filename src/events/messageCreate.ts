import { Events } from "discord.js"
import { IEventFunc } from "../lib/handlers/file-handlers/EventHandler.js"
import { SpawnManager } from "../lib/handlers/countryballs/SpawnHandler.js"
import Discord from "discord.js"
import Debug from "../lib/util/Debug.js"
import Util from "../lib/util/Util.js"

const loggerID = "MessageHandler"
const eventType = Events.MessageCreate

const eventFunction: IEventFunc<typeof eventType> = async (client, loggerID, message) => {

    let guild = message.guild
    if (!guild) return

    // Manual override since now the bot caches messages
    // on startup and finds the last ballspawn
    // SpawnManager.monitorActive = true

    if (!SpawnManager.monitorActive) {
        if (!Util.isMessageBallsdexSpawnMessage(message)) 
            return

        // Slightly off, real bot uses the message just before the spawn message
        // Also need a script to get the last 100 messages and fill message cache
        SpawnManager.getGuildSpawnCooldown(guild.id)?.reset(message.createdAt)
        SpawnManager.monitorActive = true

        return
    }

    // Watch for ballsdex reset and mimic
    if (Util.isMessageBallsdexSpawnMessage(message)) {
        let cooldown = SpawnManager.getGuildSpawnCooldown(guild.id)
        if (!cooldown) {
            Debug.logError("Tried to reset cooldown but was unable to find the guild cooldown object", loggerID)
            message.channel.send("<@617427512653512744> an error occured, check the logs.")
            return 
        }
        let messageUsedToReset = (cooldown.LastHandledMessage != null) ? cooldown.LastHandledMessage : message
        if (cooldown.LastHandledMessage == null) Debug.logWarning("Reset using ballsdex message instead of likely prompt message", loggerID)
        cooldown.reset(messageUsedToReset.createdAt)
    }

    // Handle messages (copied from countryballs/cog.py)
    if (message.author.bot)
        return
    // NOTE: Guild cache and blacklist not setup
    //if guild.id not in self.spawn_manager.cache:
    //    return
    //if guild.id in self.bot.blacklist_guild:
    //    return
    SpawnManager.handleMessage(message)
}

const eventData = {
    event: eventType,
    once: false
}

export { eventFunction, eventData }