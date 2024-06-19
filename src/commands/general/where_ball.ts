import Discord, { ColorResolvable } from "discord.js"
import Util from "../../lib/util/Util.js";
import { ECommandTags, ISlashCommandFunc } from "../../lib/handlers/file-handlers/CommandHandler.js";
import { SpawnManager } from "../../lib/handlers/countryballs/SpawnHandler.js";
import parseMilliseconds from "parse-ms";
import colorconfig from "../../config/colors.json" assert { type: "json" }

const commandFunction: ISlashCommandFunc = async (interaction, options, client, loggerID) => {

    // Check for monitor
    if (!SpawnManager.monitorActive)
        return interaction.reply({embeds: [Util.embedMessage("Inactive monitor, waiting for ball to spawn")]})

    // See if cooldown info exists for guild
    let cooldown = SpawnManager.getGuildSpawnCooldown(interaction.guild?.id ?? "")
    let guild = interaction.guild
    if (!cooldown || !guild)
        return interaction.reply({embeds: [Util.embedMessage("Unable to find monitor information")]})

    // Parse the time into strings for "time since last spawn" and "can spawn in"
    // its = intervalTimeStuff
    let cooldownMilliseconds = 600000 - (interaction.createdAt.getTime() - cooldown.Time.getTime())
    let its = parseMilliseconds(cooldownMilliseconds)
    let days = (its.days != 0) ? `${its.days}d ` : ""
    let hours = (its.hours != 0) ? `${its.hours}h ` : ""
    let intervalLeftString = `${days}${hours}${its.minutes}m ${its.seconds}s`

    let lowerBoundPoints = SpawnManager.calcChanceBound(interaction, false, cooldown)
    let upperBoundPoints = SpawnManager.calcChanceBound(interaction, true, cooldown)

    // Calculate chance to spawn (from 0 to 1)
    let chance = 0
    let certain = true
    if (cooldownMilliseconds < 0 && cooldown.Amount >= lowerBoundPoints && cooldown.Amount < upperBoundPoints) {
        // Assuming next message will be worth 0.5 (FOR THIS SERVER ONLY)
        certain = false
        chance = cooldown.calcSpawnChanceForNextMessage(interaction, 0.5)
    }
    if (cooldown.Amount >= upperBoundPoints)
        chance = 1
    let description = ` `

    // Get and parse time till guaranteed spawn
    let maxMinutesTillSpawn = 0
    if (cooldown.Amount <= upperBoundPoints) 
        maxMinutesTillSpawn = SpawnManager.calcMinutesTillAmount(guild, cooldown.Amount - 0.125, upperBoundPoints)
    let maxMinutesParsed = parseMilliseconds(maxMinutesTillSpawn * 60 * 1000)

    // Get color of embed
    let color: string = ""
    if (cooldownMilliseconds > 0)
        color = "#4d104f" // Dark purple
    else if (chance == 1)
        color = colorconfig.main // Cyan
    else if (chance >= 0 && chance < 1)
        color = Util.lerpHexColor("#FF0000", "#00FF00", chance);
    else 
        color = "#000000"

    // Build embed
    const embed = Util.standardEmbedMessage("Where Ball", description)
        .setFields(
            { name: "Can Spawn In", value: intervalLeftString, inline: true },
            { name: "Max Time till Ball", value: `${maxMinutesParsed.hours}h ${maxMinutesParsed.minutes}m`, inline: true},
            { name: "Spawn Chance", value: `${(!certain) ? "~" : ""}${(chance * 100).toFixed(2)}%`, inline: true},
            { name: "Points to Spawn", value: `${lowerBoundPoints.toLocaleString()} - ${upperBoundPoints.toLocaleString()}`, inline: true },
            { name: "Cooldown Points", value: `${cooldown.Amount} message(s)`, inline: true },
        )
        .setColor(color as ColorResolvable)
        
    // Send embed
    interaction.reply({embeds: [embed]})
}

const buildData = new Discord.SlashCommandBuilder()
    .setName("where_ball")
    .setDescription("Small portion of monitor for telling when next spawn is.")
    .toJSON()

const tags: ECommandTags[] = [ECommandTags.Complete, ECommandTags.General]

export { commandFunction, buildData, tags }
