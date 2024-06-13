import Discord , { Events } from "discord.js"
import { ECommandTags } from "../lib/handlers/file-handlers/CommandHandler.js"
import { IEventFunc } from "../lib/handlers/file-handlers/EventHandler.js"
import Util from "../lib/util/Util.js"
import messageConfig from "../config/messages.json" assert { type: "json" }
import clientconfig from "../config/client.json" assert { type: "json" }
import Debug from "../lib/util/Debug.js"
import FHH from "../lib/handlers/HandlerHub.js"

const eventType = Events.InteractionCreate

const processCommand: IEventFunc<typeof eventType> = async (client, loggerID, interaction) => {

    // For typesafety
    interaction = interaction as Discord.ChatInputCommandInteraction
    
    // Get command
    const slashCommand = FHH.CommandHandler.getSlashCommand(interaction)
    if (!slashCommand) {
        Debug.logError(messageConfig.error.command.processedNonExistentCommand, loggerID)
        console.log(interaction)
        return
    }

    // If command is marked incomplete then check for bot testing role to execute command
    // if (slashCommand.hasTag(ECommandTags.Incomplete) && interaction.member instanceof Discord.GuildMember){

    //     const isBotTester = interaction.member.roles.cache.has(clientconfig.homeGuild.roles.botTesterId)
        
    //     if (!isBotTester) {
    //         const errorMessage = messageConfig.error.userNoTestingRights + `\nOnly users with the <@&${clientconfig.homeGuild.roles.botTesterId}> role can test this command!`
    //         interaction.reply({ embeds: [Util.standardEmbedMessage(interaction.commandName, errorMessage)] })
    //         return 
    //     }  
    // } 
    
    // Execute command
    FHH.CommandHandler.executeSlashCommand(interaction)
}

const processAutocomplete: IEventFunc<typeof eventType> = async (client, loggerID, interaction) => {

    // For typesafety
    interaction = interaction as Discord.AutocompleteInteraction

    // Get command
    const slashCommand = FHH.CommandHandler.getSlashCommand(interaction)
    if (!slashCommand) {
        Debug.logError(messageConfig.error.command.processedNonExistentCommand, loggerID)
        console.log(interaction)
        return
    }

    if(slashCommand.hasAutocomplete())  slashCommand.autocomplete(interaction, client) 
}

const eventFunction: IEventFunc<typeof eventType> = async (client, loggerID, interaction) => {

    // Filter command interactions
    if (interaction.isCommand()) 
        processCommand(client, loggerID, interaction)

    // Filter autocomplete interactions
    if (interaction.isAutocomplete()) 
        processAutocomplete(client, loggerID, interaction)
}

const eventData = {
    event: eventType,
    once: false
}

export { eventFunction, eventData }