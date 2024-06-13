import http from "http"
import Debug from "../lib/util/Debug.js"
import path from "path"

const loggerID = path.parse(import.meta.url).base

// Actual script
export function keepAlive() {
    const PORT = 3000
    const server = http.createServer((req, res) => {
        res.writeHead(200)
        res.write("I'm alive")
        res.end()
    })
    server.listen(PORT, () => {
        Debug.log(`Server runnning on port: ${PORT}`, loggerID)
    })
}

// Calling this function from an import will load the 
// actual file which triggers the function call below.
// Once this has been called and the script is loaded
// use the actual keepAlive() function.
export function loadKeepAlive() {}

// Call the function in case we
// are running this script by itself
keepAlive()