import Discord from "discord.js"
import Util from "../../lib/util/Util.js";
import { ECommandTags, ISlashCommandFunc } from "../../lib/handlers/file-handlers/CommandHandler.js";
import { SpawnCooldown, SpawnManager } from "../../lib/handlers/countryballs/SpawnHandler.js";
import parseMilliseconds from "parse-ms";
// import { client } from "../../client.js";
// import clientconfig from "../../config/client.json" assert { type: "json" }

// let cooldown = new SpawnCooldown(new Date(), await client.guilds.fetch(clientconfig.homeGuild.id))

const commandFunction: ISlashCommandFunc = async (interaction, options, client, loggerID) => {

    // SpawnManager.monitorActive = true
    
    if (!SpawnManager.monitorActive)
        return interaction.reply({embeds: [Util.embedMessage("Inactive monitor, waiting for ball to spawn")]})

    let cooldown = SpawnManager.getGuildSpawnCooldown(interaction.guild?.id ?? "")
    let guild = interaction.guild
    if (!cooldown || !guild)
        return interaction.reply({embeds: [Util.embedMessage("Unable to find monitor information")]})

    let description = `\`MC\` stands for "Member Count," \`NEC\` stands for "Not Enough Contribution," and \`NEUC\` stands for "Not Enough Unique Chatters."`

    // its = intervalTimeStuff
    let its = parseMilliseconds(600000 - (interaction.createdAt.getTime() - cooldown.Time.getTime()))
    // tslp = timeSinceLastSpawn
    let tslp = parseMilliseconds(interaction.createdAt.getTime() - cooldown.Time.getTime())
    // let intervalLeftString = ((its.minutes > 0) ? `${its.minutes}m ` : "") + `${its.seconds}s`
    let intervalLeftString = `${its.minutes}m ${its.seconds}s`

    const embed = Util.standardEmbedMessage("Ballsdex Monitor", description)
        .setFields(
            { name: "Can Spawn In", value: intervalLeftString, inline: true },
            { name: "Guild Multiplier", value: `${SpawnManager.getMultiplier(guild).toLocaleString()}`, inline: true },
            { name: "Messages to Spawn", value: `${SpawnManager.calcChance(interaction, false, cooldown).toLocaleString()} - ${SpawnManager.calcChance(interaction, true, cooldown).toLocaleString()}`, inline: true },
            { name: "Time Since Last Spawn", value: `${tslp.days}d ${tslp.hours}h ${tslp.minutes}m ${tslp.seconds}s`, inline: true },
            { name: "Guild Spam Messages", value: `${cooldown.getSpamMessageDetectedInCache()} message(s)`, inline: true },
            { name: "Cooldown Amount", value: `${cooldown.Amount} message(s)`, inline: true },
            { name: "Guild MC Penalty", value: `${cooldown.hasMemberCountPenalty()}`, inline: true },
            { name: "Author NEC Penalty", value: `${cooldown.authorHasNotEnoughContributionPenalty(interaction)}`, inline: true },
            { name: "Guild NEUC Penalty", value: `${cooldown.hasNotEnoughUniqueChattersInCachePenalty()}`, inline: true },
        )
        .setFooter({ text: `Message Cache: ${cooldown.MessageCache.length}/${cooldown.MessageCache.maxLength}`})
    interaction.reply({embeds: [embed]})
}

const buildData = new Discord.SlashCommandBuilder()
    .setName("view_monitor")
    .setDescription("View ballsdex monitor")
    .toJSON()

const tags: ECommandTags[] = [ECommandTags.Complete, ECommandTags.General]

export { commandFunction, buildData, tags }
