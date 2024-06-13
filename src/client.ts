import { Client, GatewayIntentBits} from "discord.js";
import * as dotenv from "dotenv";
import Debug  from "./lib/util/Debug.js";
import path from "node:path"
import { loadKeepAlive } from "./scripts/keepAlive.js";
import FHH from "./lib/handlers/HandlerHub.js";

export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// const client = new Client({ intents: [] });
const loggerID = path.parse(import.meta.url).base

async function start() {

    // Broadcast start message
    Debug.logStartup("starting client...", loggerID)

    // Thing to keep render server online
    loadKeepAlive()

    // Configure enviroment variables
    dotenv.config();
    
    // Load events
    FHH.EventHandler.cacheClient(client)
    await FHH.EventHandler.loadEventFolder("dist/events")

    // Login
    await client.login(process.env.CLIENT_LOGIN_TOKEN);
}
start()