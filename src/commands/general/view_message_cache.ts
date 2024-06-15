import Discord, { EmbedBuilder } from "discord.js"
import Util from "../../lib/util/Util.js";
import { ECommandTags, ISlashCommandFunc } from "../../lib/handlers/file-handlers/CommandHandler.js";
import { SpawnCooldown, SpawnManager } from "../../lib/handlers/countryballs/SpawnHandler.js";
import parseMilliseconds from "parse-ms";
// import { client } from "../../client.js";
// import clientconfig from "../../config/client.json" assert { type: "json" }

// let cooldown = new SpawnCooldown(new Date(), await client.guilds.fetch(clientconfig.homeGuild.id))

const commandFunction: ISlashCommandFunc = async (interaction, options, client, loggerID) => {

    // Check for monitor
    if (!SpawnManager.monitorActive)
        return interaction.reply({embeds: [Util.embedMessage("Inactive monitor, waiting for ball to spawn")]})

    // See if cooldown info exists for guild
    let cooldown = SpawnManager.getGuildSpawnCooldown(interaction.guild?.id ?? "")
    let guild = interaction.guild
    if (!cooldown || !guild)
        return interaction.reply({embeds: [Util.embedMessage("Unable to find monitor information")]})
  
    // Get an array of yap info {name: string, msgLength: number, spamLength: number}[]
    // and sort objects from most messages to least messages
    let yappers = cooldown.getYappers()
    let yapDetails = yappers.map((yapper) => { 
        return { 
            name: yapper.name, 
            msgLength: cooldown.getAuthorMessages(interaction.user.id).length, 
            spamLength: cooldown.getAuthorMessages(interaction.user.id).map((cacheMsg) => {
                return cooldown.isMessageSpam(cacheMsg.messageContent)
            }).length
        }
    }).sort((a, b) => b.msgLength - a.msgLength)
    
    // Build embed where each object field gets an inline embed field
    const embed = new EmbedBuilder()
        .setTitle("Ballsdex Message Cache")
        .setFields(
            { name: "Yappers", value: yapDetails.map((yapper) => yapper.name).join("\n"), inline: true },
            { name: "Contribution", value: `${yapDetails.map((yapper) => yapper.msgLength).join("\n")} message(s)`, inline: true },
            { name: "Spam", value: `${yapDetails.map((yapper) => yapper.spamLength).join("\n")} message(s)`, inline: true },
        )
        .setFooter({ text: `Message Cache: ${cooldown.MessageCache.length}/${cooldown.MessageCache.maxLength}`})

    // Send message
    interaction.reply({embeds: [embed]})
}

const buildData = new Discord.SlashCommandBuilder()
    .setName("view_message_cache")
    .setDescription("View message cache details")
    .toJSON()

const tags: ECommandTags[] = [ECommandTags.Complete, ECommandTags.General]

export { commandFunction, buildData, tags }
