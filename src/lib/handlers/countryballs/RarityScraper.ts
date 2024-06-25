import cheerio from "cheerio"
import Debug from "../../util/Debug.js";

export default class RarityScraper {

    private static readonly loggerID = "RarityScraper" // Not in og code
    private static readonly RAW_RARITY_URL = 'https://ballsdex.miraheze.org/wiki/Rarity_raw';

    private static rarityList: { rarity: number, name: string }[] = []

    public static async loadRarities(): Promise<void> {

        Debug.log("Scraping rarity raw wiki...", this.loggerID)

        let content = await fetch(this.RAW_RARITY_URL)
        let body = await content.text()
        const $ = cheerio.load(body);

        Debug.log("Loading rarity list...", this.loggerID)
        // Select the content inside the specified class
        $('.mw-parser-output').each((index, element) => {
            let items = $(element).text().split("\n")
            items.forEach((stuff) => {
                let item = stuff.split(".")
                if (!Number.isNaN(item[0]) && item.length == 2) 
                    this.rarityList.push({ rarity: parseInt(item[0].trim()), name: item[1].trim() })
            })
        })
        Debug.log(`Loaded ${this.rarityList.length} country rarities!`, this.loggerID)
    }
    
    public static get getCountries(): string[] {
        return this.rarityList.map((entry) => entry.name)
    }
    
    public static get getRarityList(): { rarity: number, name: string }[] {
        return [...this.rarityList]
    }
}