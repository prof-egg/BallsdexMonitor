/******************************************************************************
 *  Dependencies: discord.js, clientconfig.json, colorconfig.json
 *
 *  A library with random but useful static methods.
 * 
 ******************************************************************************/

import Discord, { ColorResolvable } from "discord.js"
import clientconfig from "../../config/client.json" assert { type: "json" }
import colorconfig from "../../config/colors.json" assert { type: "json" }

/**
 * The `Util` class provides random
 * but useful static methods.
 */
export default class Util {
    
    /**
     * The name of the current working folder if successful; `null` otherwise
     * @param {string} path a directory path
     * @returns the name of the current working folder if successful; `null` otherwise
     */
    static extractFolderName(path: string): string | null {
        // Split the path by the directory separator ("/" or "\") depending on the OS
        const pathParts = path.split(/[\\\/]/);
        
        // Remove any empty parts resulting from multiple separators
        const cleanedParts = pathParts.filter(part => {return part.trim() !== ""});
    
        return (cleanedParts.length > 0) ? cleanedParts[cleanedParts.length - 1] : null
    }

    /**
     * Returns a `Discord.EmbedBuilder` object the title set to `title`, 
     * the description set to `message`, and the color set to main embed color.
     * @param {string} title the title of your embed
     * @param {string} message the description of your embed
     * @returns Returns a `Discord.EmbedBuilder` object the title set to `title`, the description set to `message`, and the color set to main embed color.
     */
    static standardEmbedMessage(title: string, message: string, footer?: string): Discord.EmbedBuilder {
        if (!footer) footer = `${clientconfig.name} v${clientconfig.version}`
        const embed = new Discord.EmbedBuilder()
            .setTitle(title)
            .setDescription(message)
            .setFooter({ text: footer })
            .setColor(colorconfig.main as ColorResolvable)
        return embed
    }
    
    /**
     * Returns a `Discord.EmbedBuilder` object with a description set 
     * to `message`, and the color set to main embed color.
     * @param {Discord.EmbedBuilder} message the description of your embed
     * @returns Returns a `Discord.EmbedBuilder` obbject with a description set to `message`, and the color set to main embed color.
     */
    static embedMessage(message: string): Discord.EmbedBuilder {
        const embed = new Discord.EmbedBuilder()
            .setDescription(message)
            .setColor(colorconfig.main as ColorResolvable)
        return embed
    }

    /**
     * Returns a string formatted as `<:emojiName:emojiID>` if successful; `undefined` otherwise.
     * @param {Discord.Client} client your discord client instance
     * @param {string} id the id of the discord server emoji you want to grab
     * @returns a string formatted as `<:emojiName:emojiID>` if successful; `undefined` otherwise
     */
    static emoji(client: Discord.Client, id: string): string | undefined {
        return client.emojis.cache.get(id)?.toString();
    }
}