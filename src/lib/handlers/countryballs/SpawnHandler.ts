import Discord from "discord.js"
import { Random } from "../../util/Random.js"
import Debug from "../../util/Debug.js"
import ballsdexConfig from "../../../config/ballsdex.json" assert { type: "json" }
import Util from "../../util/Util.js"

const loggerID = "SpawnHandler" // Not in og code
export const SPAWN_CHANCE_RANGE = { LOWER_BOUND: 40, UPPER_BOUND: 55 }

/**
 * **COPY-PASTED DOC, NOT APPLICABLE TO JS TRANSLATION**
 * Represents the spawn internal system per guild. Contains the counters that will determine
 * if a countryball should be spawned next or not.
 *
 * Attributes
 * ----------
 * time: datetime
 *     Time when the object was initialized. Block spawning when it's been less than two minutes
 * amount: float
 *     A number starting at 0, incrementing with the messages until reaching `chance`. At this
 *     point, a ball will be spawned next.
 * chance: int
 *     The number `amount` has to reach for spawn. Determined randomly with `SPAWN_CHANCE_RANGE`
 * lock: asyncio.Lock
 *     Used to ratelimit messages and ignore fast spam
 * message_cache: ~collections.deque[CachedMessage]
 *     A list of recent messages used to reduce the spawn chance when too few different chatters
 *     are present. Limited to the 100 most recent messages in the guild.
 *
 **/
export class SpawnCooldown {

    private time: Date
    // In the og bot code, amount is initialized to SPAWN_CHANCE_RANGE[0] // 2
    // explained by this comment "initialize partially started, to reduce the dead time after starting the bot"
    // Im not doing that here as the stats arent based on this clients downtime or anything
    // in the future maybe watch out for the bot restarting, idk not a big deal
    private amount: number = 1
    private chance: number = Random.randInt(SPAWN_CHANCE_RANGE.LOWER_BOUND, SPAWN_CHANCE_RANGE.UPPER_BOUND + 1)
    private messageCache: MessageCache = new MessageCache(100)

    public constructor(time: Date, guild: Discord.Guild) {
        this.time = time

        // Not in OG code
        this.guild = guild
    }

    public reset(time: Date): void {
        this.amount = 1.0
        // In python `random()` is in inclusive of both end points.
        this.chance = Random.randInt(SPAWN_CHANCE_RANGE.LOWER_BOUND, SPAWN_CHANCE_RANGE.UPPER_BOUND + 1)
        // Python code in og script to prevent race conditions
        // Not sure if i need to replicate it since this bot is only in one server
        //try:
        //    self.lock.release()
        //except RuntimeError:  # lock is not acquired
        //    pass
        this.time = time
    }

    public increase(message: Discord.Message): boolean {
        // COPY PASTED COMMENT:
        // # this is a deque, not a list
        // # its property is that, once the max length is reached (100 for us),
        // # the oldest element is removed, thus we only have the last 100 messages in memory
        this.messageCache.push(
            new CachedMessage(message.content, message.author.id, message.author.displayName)
        )

        // More python code to deal with race conditions
        //if self.lock.locked():
        //    return False

        // Replacement code to make sure 10 seconds has passed
        // Make sure 10 seconds have passed since last handled message
        if (this.lastHandledMessage != null) {
            let seconds = (message.createdAt.getTime() - this.lastHandledMessage.createdAt.getTime()) / 1000
            // console.log("Seconds passed: " + seconds)
            if (seconds < 10)
                return false
            else 
                this.lastHandledMessage = message
        } else {
            this.lastHandledMessage = message
        }
            
        // async with self.lock:
        let amount = 1
        if (message.guild && (message.guild.memberCount < 5 || message.guild.memberCount > 1000))
            amount /= 2
        if (message.content.length < 5)
            amount /= 2
        if (
            new Set(this.messageCache.map((cachedMessage) => cachedMessage.authorID)).size < 4 ||
            this.messageCache.filter((cachedMessage) => cachedMessage.authorID == message.author.id).length
            / this.messageCache.maxLength < 0.4
        ) {
            amount /= 2
        }
        this.amount += amount
        //await asyncio.sleep(10)
        return true
    }

    /***************************************************************************
    * NOTE: These werent here in og code but I 
    * added them for javascript neat purposes
    ***************************************************************************/

    private guild: Discord.Guild
    private lastHandledMessage: Discord.Message | null = null

    public async resetMessageCache(guild: Discord.Guild, lastSpawnMessage: Discord.Message): Promise<void> {
        Debug.log("Resetting message cache...", loggerID)

        this.messageCache = new MessageCache(100)

        let guildChannels = await guild.channels.fetch()
        const fetchPromises: Promise<Discord.Collection<string, Discord.Message<true>>>[] = [];

        // Iterate over each text channel in the guild
        guildChannels.forEach((channel) => {
            if (channel?.type === Discord.ChannelType.GuildText) 
                // Push the promise to fetch messages into the array
                fetchPromises.push(channel.messages.fetch({ limit: 100 }));
        });

        // Execute all fetch operations concurrently
        const fetchedMessagesArray = await Promise.all(fetchPromises);
        
        // Combine all fetched messages into a single array
        const fetchedMessages: Discord.Message[] = []
        fetchedMessagesArray.forEach((collection) => {
            collection.forEach((msg) => fetchedMessages.push(msg))
        })

        // Sort messages by timestamp in order of oldest to newest
        fetchedMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        Debug.log(`Sorted ${fetchedMessages.length} messages`, loggerID)

        // Get two groups of arrays that surround the last spawn
        let preSpawnMessages = fetchedMessages.filter((msg) => msg.createdTimestamp < lastSpawnMessage.createdTimestamp)
        let postSpawnMessages = fetchedMessages.filter((msg) => msg.createdTimestamp > lastSpawnMessage.createdTimestamp)
        Debug.log(`Pre-spawn messages: ${preSpawnMessages.length}`, loggerID)
        Debug.log(`Post-spawn messages: ${postSpawnMessages.length}`, loggerID)

        // Get the index of the first gaurenteed message to be picked up by the ballsdex bot
        for (var firstMessageIndex = 1; firstMessageIndex < preSpawnMessages.length; firstMessageIndex++) 
            if (preSpawnMessages[firstMessageIndex].createdTimestamp - preSpawnMessages[firstMessageIndex - 1].createdTimestamp > 10_000)
                break;

        // Simulate stuff
        for (let i = firstMessageIndex; i < preSpawnMessages.length; i++)
            if (SpawnManager.canMessageBeProcessed(preSpawnMessages[i]))
                this.increase(preSpawnMessages[i])
        this.reset(lastSpawnMessage.createdAt)
        for (let i = 0; i < postSpawnMessages.length; i++)
            if (SpawnManager.canMessageBeProcessed(postSpawnMessages[i]))
                this.increase(postSpawnMessages[i])

        // Fill message cache from fetched messages
        Debug.log("Reset message cache complete!", loggerID)
    }

    public getYappers():  {id: string, name: string}[] {
        return [...(new Map(this.messageCache.map((cachedMessage) => {
            return [cachedMessage.authorID, cachedMessage.displayName]
        })))].map((obj) => ({id: obj[0], name: obj[1]}))
    }

    // public calcMessageScore(message: string, authorID: string): number {
    //     let amount = 1
    //     if (this.hasMemberCountPenalty())
    //         amount /= 2
    //     if (this.isMessageSpam(message))
    //         amount /= 2
    //     if (
    //         this.hasNotEnoughUniqueChattersInCachePenalty() ||
    //         this.authorHasNotEnoughContributionPenalty(authorID)
    //     ) {
    //         amount /= 2
    //     }
    //     return amount;
    // }

    public calcSpawnChanceForNextMessage(interaction: Discord.ChatInputCommandInteraction, messageScore: number): number {
        return 1 / (SpawnManager.calcChanceBound(interaction, true) - this.amount + (1 - messageScore))
    }

    public getAuthorMessages(authorID: string): CachedMessage[] {
        return this.messageCache.filter((msgCache) => msgCache.authorID == authorID)
    }

    public isMessageSpam(message: string): boolean {
        return message.length < 5
    }

    public hasMemberCountPenalty(): boolean {
        return this.guild.memberCount < 5 || this.guild.memberCount > 1000
    }

    public getSpamMessageDetectedInCache(): number {
        return this.messageCache.filter((cachedMessage) => this.isMessageSpam(cachedMessage.messageContent)).length
    }

    public authorHasNotEnoughContributionPenalty(authorID: string): boolean {
        return (this.messageCache.filter((cachedMessage) => cachedMessage.authorID == authorID).length
        / this.messageCache.maxLength < 0.4)
    }

    public hasNotEnoughUniqueChattersInCachePenalty(): boolean {
        return new Set(this.messageCache.map((cachedMessage) => cachedMessage.authorID)).size < 4
    }

    /**Time since initial restart*/
    public get Time(): Date {
        return this.time
    }

    public get Chance(): number {
        return this.chance
    }

    public get Amount(): number {
        return this.amount
    }

    public get MessageCache(): MessageCache {
        return this.messageCache
    }

    public get LastHandledMessage(): Discord.Message | null {
        return this.lastHandledMessage
    }
}

export class SpawnManager {
    private static cooldowns: Discord.Collection<string, SpawnCooldown> = new Discord.Collection()

    // Used for mapping spawn channel ids to guild ids
    // private cache: Discord.Collection<number, number> = new Discord.Collection() // Not used

    public static handleMessage(message: Discord.Message): void {
        let guild = message.guild
        if (!guild) 
            return
        
        let cooldown = this.cooldowns.get(guild.id)
        if (!cooldown) {
            cooldown = new SpawnCooldown(message.createdAt, guild)
            this.cooldowns.set(guild.id, cooldown)
        }

        // Delta is in seconds
        let delta = Math.floor((message.createdAt.getTime() - cooldown.Time.getTime()) / 1000)

        // # change how the threshold varies according to the member count, while nuking farm servers
        let multiplier = 0
        if (!guild.memberCount)
            return
        else if (guild.memberCount < 5)
            multiplier = 0.1
        else if (guild.memberCount < 100)
            multiplier = 0.8
        else if (guild.memberCount < 1000)
            multiplier = 0.5
        else
            multiplier = 0.2
        let chance = cooldown.Chance - multiplier * Math.floor(delta / 60)

        // # manager cannot be increased more than once per 5 seconds
        if (!cooldown.increase(message))
            return

        // # normal increase, need to reach goal
        if (cooldown.Amount <= chance)
            return 

        // # at this point, the goal is reached
        if (delta < 600)
            // # wait for at least 10 minutes before spawning
            return
        
        // Dont want to run the reset or spawn function
        // since we dont need to spawn country balls ourselves
        // and we match the simulated resets with the actual ballsdex resets
        // # spawn countryball
        //cooldown.reset(message.createdAt)
        //await self.spawn_countryball(guild)
    }

    // async def spawn_countryball(self, guild: discord.Guild):
    //     channel = guild.get_channel(self.cache[guild.id])
    //     if not channel:
    //         log.warning(f"Lost channel {self.cache[guild.id]} for guild {guild.name}.")
    //         del self.cache[guild.id]
    //         return
    //     ball = await CountryBall.get_random()
    //     await ball.spawn(cast(discord.TextChannel, channel))

    /***************************************************************************
    * NOTE: These werent here in og code but I added them for 
    * easy monitor viewing
    ***************************************************************************/
    public static monitorActive = false;

    public static async getLatestBallSpawn(guild: Discord.Guild): Promise<Discord.Message | null> {
        Debug.log("Getting latest ball spawn...", loggerID)
        let ballsdexChannel = await guild.channels.fetch(ballsdexConfig.channelID) as Discord.GuildTextBasedChannel | null

        // If error resort to current time
        if (!ballsdexChannel) {
            Debug.logWarning("Unable to retrieve ballsdex channel", loggerID)
            return null
        }
        
        // Fetch and sort messages
        let messages = await ballsdexChannel.messages.fetch({ limit: 100 })
        messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp)

        // Look for spawn
        for (var i = 0; i < messages.size; i++) {
            let testMsg = messages.at(i)
            if (!testMsg) continue
            if (Util.isMessageBallsdexSpawnMessage(testMsg)) {
                Debug.log("Found ball spawn!", loggerID)
                return testMsg
            }
        }

        Debug.logWarning("Unable to find ball spawn", loggerID)
        return null
    }

    /**
     * 
     * @param guild 
     * @param amount Amount of points we are waiting for
     * @param chance The internal random number between 40 - 55
     * @returns 
     */
    public static calcMinutesTillAmount(guild: Discord.Guild, amount: number, chance: number): number {
        return Math.ceil((amount - chance) / -SpawnManager.getMultiplier(guild))
    }

    public static canMessageBeProcessed(message: Discord.Message): boolean {
        return !message.author.bot
    }

    public static ensureGuildCooldown(guild: Discord.Guild, message?: Discord.Message): void {
        let cooldown = this.cooldowns.get(guild.id)
        if (!cooldown) 
            this.cooldowns.set(guild.id, new SpawnCooldown(message?.createdAt ?? new Date(), guild))
    }

    public static getMultiplier(guild: Discord.Guild): number {
        
        let multiplier = 0
        /*if (!guild.memberCount)
            return
        else*/ if (guild.memberCount < 5)
            multiplier = 0.1
        else if (guild.memberCount < 100)
            multiplier = 0.8
        else if (guild.memberCount < 1000)
            multiplier = 0.5
        else
            multiplier = 0.2

        return multiplier
    }



    /**Returns -1 if no cooldown cached, and 0 if no guild from message or is actually 0 chance */
    public static calcChanceBound(interaction: Discord.ChatInputCommandInteraction, upperBound?: boolean, cooldownOverride?: SpawnCooldown): number {

        if (!interaction.guild) {
            Debug.logWarning("Called SpawnManager.calcChance() on a message that has no guild", loggerID)
            console.log(interaction)
            return 0
        }

        let cooldown = cooldownOverride ?? this.cooldowns.get(interaction.guild.id)
        if (!cooldown) return -1
        
        let delta = Math.floor((interaction.createdAt.getTime() - cooldown.Time.getTime()) / 1000)
        return (((upperBound) ? SPAWN_CHANCE_RANGE.UPPER_BOUND : SPAWN_CHANCE_RANGE.LOWER_BOUND) - this.getMultiplier(interaction.guild) * Math.floor(delta / 60))
    }

    public static getGuildSpawnCooldown(guildID: string): SpawnCooldown | undefined {
        return this.cooldowns.get(guildID)
    }

    public static getSpawnChanceRange(): { LOWER_BOUND: number, UPPER_BOUND: number } {
        return SPAWN_CHANCE_RANGE
    }
}

class MessageCache extends Array<CachedMessage> {

    public readonly maxLength: number

    public constructor(maxLength: number) {
        super()
        this.maxLength = maxLength
    }

    public override push(...items: CachedMessage[]): number {
        super.push(...items)
        if (this.length > this.maxLength)
            super.shift()
        return this.length
    }
}

class CachedMessage {
    public readonly messageContent: string
    public readonly authorID: string
    public readonly displayName: string // Not part of original cache
    public constructor(messageContent: string, authorID: string, displayName: string) {
        this.messageContent = messageContent
        this.authorID = authorID
        this.displayName = displayName
    }
}