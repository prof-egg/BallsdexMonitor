import Discord from "discord.js"
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

    // Explain shortened embed field titles
    let description = `\`MC\` stands for "Member Count," \`NEC\` stands for "Not Enough Contribution," and \`NEUC\` stands for "Not Enough Unique Chatters."`

    // Parse the time into strings for "time since last spawn" and "can spawn in"
    // its = intervalTimeStuff
    let its = parseMilliseconds(600000 - (interaction.createdAt.getTime() - cooldown.Time.getTime()))
    // tslp = timeSinceLastSpawn
    let tslp = parseMilliseconds(interaction.createdAt.getTime() - cooldown.Time.getTime())
    // let intervalLeftString = ((its.minutes > 0) ? `${its.minutes}m ` : "") + `${its.seconds}s`
    let days = (its.days != 0) ? `${its.days}d ` : ""
    let hours = (its.hours != 0) ? `${its.hours}h ` : ""
    let intervalLeftString = `${days}${hours}${its.minutes}m ${its.seconds}s`

    // Get prime yappers by checking if NEUC is false and any member has NEC false
    // Parse the prime yappers into a string if there are any; else string is "None"
    let arePrimeYapperEligible = !cooldown.hasNotEnoughUniqueChattersInCachePenalty()
    let yapperIds = cooldown.getYappers().map((yapper) => yapper.id)
    let primeYappers = yapperIds.filter((authorID) => {
        return !cooldown.authorHasTooMuchContributionPenalty(authorID) && arePrimeYapperEligible
    }).map((authorID) => {
        return `<@${authorID}>`
    })
    let primeYappersString = (primeYappers.length > 0) ? primeYappers.join(", ") : "None"

    // author messages
    let authorMessages = cooldown.getAuthorMessages(interaction.user.id)

    // Build embed
    const embed = Util.standardEmbedMessage("Ballsdex Monitor", description)
        .setFields(
            { name: "Can Spawn In", value: intervalLeftString, inline: true },
            { name: "Guild Multiplier", value: `${SpawnManager.getMultiplier(guild).toLocaleString()}`, inline: true },
            { name: "Points to Spawn", value: `${SpawnManager.calcChanceBound(interaction, false, cooldown).toLocaleString()} - ${SpawnManager.calcChanceBound(interaction, true, cooldown).toLocaleString()}`, inline: true },
            { name: "Time Since Last Spawn", value: `${tslp.days}d ${tslp.hours}h ${tslp.minutes}m ${tslp.seconds}s`, inline: true },
            // { name: "Guild Spam Messages", value: `${cooldown.getSpamMessageDetectedInCache()} message(s)`, inline: true },
            { name: "Guild Spam Messages", value: `Disabled`, inline: true },
            { name: "Cooldown Points", value: `${cooldown.Amount} message(s)`, inline: true },
            { name: "Guild MC Penalty", value: `${cooldown.hasMemberCountPenalty()}`, inline: true },
            { name: "Author NEC Penalty", value: `${cooldown.authorHasTooMuchContributionPenalty(interaction.user.id)}`, inline: true },
            { name: "Guild NEUC Penalty", value: `${cooldown.hasNotEnoughUniqueChattersInCachePenalty()}`, inline: true },
            { name: "Prime Yappers", value: primeYappersString, inline: true },
            { name: "Author Yap Contribution", value: `${authorMessages.length} message(s)`, inline: true },
            // { name: "Author Spam Contribution", value: `${authorMessages.filter((msgCache) => cooldown.isMessageSpam(msgCache.messageContent)).length} message(s)`, inline: true },
            { name: "Author Spam Contribution", value: `Disabled`, inline: true },
        )
        .setFooter({ text: `Message Cache: ${cooldown.MessageCache.length}/${cooldown.MessageCache.maxLength}`})

    // Send embed
    interaction.reply({embeds: [embed]})
}

const buildData = new Discord.SlashCommandBuilder()
    .setName("view_monitor")
    .setDescription("View ballsdex monitor")
    .toJSON()

const tags: ECommandTags[] = [ECommandTags.Complete, ECommandTags.General]

export { commandFunction, buildData, tags }
