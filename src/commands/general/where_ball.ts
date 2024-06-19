import Discord, { ColorResolvable } from "discord.js"
import Util from "../../lib/util/Util.js";
import { ECommandTags, ISlashCommandFunc } from "../../lib/handlers/file-handlers/CommandHandler.js";
import { SpawnCooldown, SpawnManager } from "../../lib/handlers/countryballs/SpawnHandler.js";
import parseMilliseconds from "parse-ms";
import colorconfig from "../../config/colors.json" assert { type: "json" }

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

    // Parse the time into strings for "time since last spawn" and "can spawn in"
    // its = intervalTimeStuff
    let cooldownMilliseconds = 600000 - (interaction.createdAt.getTime() - cooldown.Time.getTime())
    let its = parseMilliseconds(cooldownMilliseconds)
    let days = (its.days != 0) ? `${its.days}d ` : ""
    let hours = (its.hours != 0) ? `${its.hours}h ` : ""
    let intervalLeftString = `${days}${hours}${its.minutes}m ${its.seconds}s`

    let lowerBoundPoints = SpawnManager.calcChance(interaction, false, cooldown)
    let upperBoundPoints = SpawnManager.calcChance(interaction, true, cooldown)

    // Calculate chance to spawn (from 0 to 1)
    let chance = 0
    if (cooldownMilliseconds < 0 && cooldown.Amount >= lowerBoundPoints && cooldown.Amount < upperBoundPoints) 
        chance = Util.reverseLerp(lowerBoundPoints, upperBoundPoints, cooldown.Amount)
    if (cooldown.Amount >= upperBoundPoints)
        chance = 1
    let description = `Chance to spawn next valid message: ${(chance * 100).toFixed(2)}%`

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