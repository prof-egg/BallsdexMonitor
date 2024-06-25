import Discord from "discord.js"
import Util from "../../lib/util/Util.js";
import { ECommandTags, ISlashCommandAutocompleteFunc, ISlashCommandFunc } from "../../lib/handlers/file-handlers/CommandHandler.js";
import RarityScraper from "../../lib/handlers/countryballs/RarityScraper.js";

const queryOption = "query"

const commandFunction: ISlashCommandFunc = async (interaction, options, client, loggerID) => {

    // Check if option exists (this code should 
    // never run though since the option is required)
    const query = options.getString(queryOption)
    if (!query) 
        return interaction.reply({ embeds: [Util.embedMessage(`Uknown option "${queryOption}"`)] })
    
    // Try and find the full faq based on the query
    const rarityEntry = RarityScraper.getRarityList.find((entry) => query == entry.name) 
    // If we cant find the faq (though that should never happen)
    // substitute an error message as a fake faq
    ?? { name: "Bad Query", rarity: -1 }
    
    interaction.reply({ embeds: [Util.embedMessage(`**${rarityEntry.name}** rarity: ${rarityEntry.rarity}`)] })
}

const autocomplete: ISlashCommandAutocompleteFunc = async (interaction, options, client, loggerID) => {
    // Get the user input as they are typing
    const focusedValue = options.getFocused();
    // Get autocomplete choices that the user will choose from
    const choices = RarityScraper.getRarityList.map((entry) => entry.name)
    // Filter out choices the choices that dont start with what the user typed
    let filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
    // Slice array if its too large (over 25)
    if (filtered.length > 25) filtered = filtered.slice(0, 25)
    // Respond with the auto complete suggestions
    await interaction.respond(
        filtered.map((choice) => ({ name: choice, value: choice })),
    );
}

const buildData = new Discord.SlashCommandBuilder()
    .setName("rarity")
    .setDescription("Gets the rarity of a ball")
    .addStringOption(option =>
        {return option.setName(queryOption)
            .setDescription("Ball to search for")
            .setAutocomplete(true)
            .setRequired(true)})
    .toJSON()

const tags: ECommandTags[] = [ECommandTags.Complete, ECommandTags.Utility]

export { commandFunction, autocomplete, buildData, tags }
