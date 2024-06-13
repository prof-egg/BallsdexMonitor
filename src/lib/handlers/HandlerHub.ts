import CommandHandler from "./file-handlers/CommandHandler.js";
import EventHandler from "./file-handlers/EventHandler.js";

export default class FHH {
    public static CommandHandler = new CommandHandler()
    public static EventHandler = new EventHandler()
    
}