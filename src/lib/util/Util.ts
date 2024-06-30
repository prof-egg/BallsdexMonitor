/******************************************************************************
 *  Dependencies: discord.js, clientconfig.json, colorconfig.json
 *
 *  A library with random but useful static methods.
 * 
 ******************************************************************************/

import Discord, { ColorResolvable } from "discord.js"
import clientconfig from "../../config/client.json" assert { type: "json" }
import colorconfig from "../../config/colors.json" assert { type: "json" }
import ballsdexConfig from "../../config/ballsdex.json" assert { type: "json" }

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

    static isMessageBallsdexSpawnMessage(message: Discord.Message): boolean {

        let msg = ballsdexConfig.message
        let ballsdexID = ballsdexConfig.ballsdexID
        let channelID = ballsdexConfig.guilds.find((guild) => guild.guildID == message.guild?.id)?.ballsChannelID
        
        if (channelID == undefined) return false
    
        // Debug.log(`NEW MESSAGE: ${message.author.username}: "${message.content}"`, loggerID)
        // Debug.log(`Author is bot: ${message.author.bot}`, loggerID)
        // Debug.log(`Author has ballsdex id: ${message.author.id == ballsdexID}`, loggerID)
        // Debug.log(`Message is in channel: ${message.channelId == channelID}`, loggerID)
        // Debug.log(`Message contains balls msg: ${message.content.includes(msg)}`, loggerID)
    
        // Look for activating monitor
        if (!message.author.bot)
            return false
        // Check for ballsdex id
        if (message.author.id != ballsdexID)
            return false
        // Check for ballsdex channelID
        if (message.channelId != channelID)
            return false
        // Check for spawn message
        if (!message.content.includes(msg))
            return false
    
        return true
    }

    public static lerpHexColor(color1: string, color2: string, t: number): string {
        // Remove '#' if present
        color1 = color1.replace('#', '');
        color2 = color2.replace('#', '');
    
        // Parse hex values to RGB
        const r1 = parseInt(color1.substring(0, 2), 16);
        const g1 = parseInt(color1.substring(2, 4), 16);
        const b1 = parseInt(color1.substring(4, 6), 16);
    
        const r2 = parseInt(color2.substring(0, 2), 16);
        const g2 = parseInt(color2.substring(2, 4), 16);
        const b2 = parseInt(color2.substring(4, 6), 16);
    
        // Interpolate RGB components
        const r = Math.round(r1 * (1 - t) + r2 * t);
        const g = Math.round(g1 * (1 - t) + g2 * t);
        const b = Math.round(b1 * (1 - t) + b2 * t);
    
        // Convert interpolated RGB back to hex
        const interpolatedColor = `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
    
        return interpolatedColor;
    }

    public static reverseLerp(start: number, end: number, interpolatedValue: number) {
        // Calculate t
        const t = (interpolatedValue - start) / (end - start);
        return t;
    }

    public static reverseLerpWeighted(min: number, max: number, value: number, middle: number): number {
        if (value <= min) return 0;
        if (value >= max) return 1;
    
        // Calculate the normalized position of the middle value
        const middleNormalized = (middle - min) / (max - min);
    
        if (value <= middle) {
            // If value is in the lower half, map it linearly between min and middle
            return (value - min) / (middle - min) * middleNormalized;
        } else {
            // If value is in the upper half, map it linearly between middle and max
            return middleNormalized + (value - middle) / (max - middle) * (1 - middleNormalized);
        }
    }
}