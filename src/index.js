const Discord = require("discord.js")
const client = require("mongodb").MongoClient
require("dotenv").config({ path:".env" })
const Spotify = require("./Spotify")

require("./website")

// setup vars
const bot = new Discord.Client()
const prefix = "s!"
const spotifyUsers = {}

// Database vars
let userdata
const connected = async (err, db) => {
  if (err) throw new Error("DB didn't connect")
  userdata = await db.db("spotifyBot").collection("userdata")
  console.log("Database connected")
}
client.connect("mongodb://localhost:27017", { useUnifiedTopology: true }, connected)

// Events
bot.on("ready", async () => { 
  console.log(`${bot.user.tag} is online!`)

  setTimeout(async () => {

    Spotify.getDB(userdata)

    await userdata.find({}).toArray(async(err, users) => {
      for (let i = 0; i < users.length; i++) {
        if (users[i].userID && users[i].spotify) {
          spotifyUsers[users[i].userID] = new Spotify.Client(users[i].spotify, users[i].userID)
        }
      }
    })
  }, 4000)
})

bot.on("error", async (err) => { console.error(err) })

bot.on("message", async (message) => {

  userdata.findOne({ userID: message.author.id }, async (err, user) => {
    if (err) throw new Error("DB could not find users [bot]")

    if (!message.content.startsWith(prefix)) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const cmd = args.shift().toLowerCase()

    switch (cmd) {
      case "current": require("./commands/current").run(message, spotifyUsers); break
      case "help": require("./commands/help").run(message); break
      case "pause": require("./commands/pause").run(message, spotifyUsers); break
      case "play": require("./commands/play").run(message, spotifyUsers); break
      case "playlists": require("./commands/playlists").run(message, spotifyUsers); break
      case "profile": require("./commands/profile").run(message, user); break
      case "spotify": require("./commands/spotify").run(message, spotifyUsers); break
      case "update": require("./commands/update").run(message, user, spotifyUsers); break
      default: break;
    }
  })
})

bot.login(process.env.TOKEN)