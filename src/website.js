const express = require("express")
const exphbs = require("express-handlebars")
const cookieParser = require("cookie-parser")
const path = require("path")
const fetch = require("node-fetch")
const btoa = require("btoa")
const { URLSearchParams } = require("url")
const client = require("mongodb").MongoClient

const catchAsync = fn => (
  (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch(err => next(err));
    }
  }
)
// Remember userid

let userIDS = []

// Express shit
const app = express()

app.set('views', path.join(__dirname, '../views'))
app.use(express.static(__dirname + "../public"))
app.use(cookieParser())

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}))
app.set("view engine", "handlebars")

// Database stuff
let userdata
const connected = async (err, db) => {
  if (err) throw new Error("DB didn't connect")
  userdata = await db.db("spotifyBot").collection("userdata")
}
client.connect("mongodb://localhost:27017", { useUnifiedTopology: true }, connected)

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

const discordRedirect = encodeURIComponent(`${process.env.URL}/discordCallback`)
const spotifyRedirect = encodeURIComponent(`${process.env.URL}/spotifyCallback`)

app.get("/discordLogin", async (req, res) => {
  res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${discordRedirect}`)
})
app.get("/spotifyLogin", async (req, res) => {
  let userid = req.query.userid || null
  if (userid) {
    userIDS.push(userid)
    const scopes = "playlist-read-private user-top-read playlist-read-collaborative"
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${spotifyRedirect}`)
  } else {
    res.status(401).redirect("/profile")
  }
})

app.get("/discordCallback", catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error("NoCodeProvided")
  const code = req.query.code
  const creds = btoa(`${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`)
  const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${discordRedirect}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`
      }
    })
  const json = await response.json()
  const data = await fetch('http://discordapp.com/api/users/@me',
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${json.access_token}`
      }
    })
  const dataout = await data.json()

  await userdata.findOne({ userID: dataout.id }, async (err, user) => {
    if (err) throw new Error("DB could not find users")

    if (user) {
      await userdata.deleteOne({ userID: dataout.id })
    }

    await userdata.insertOne({
      userID: dataout.id,
      username: dataout.username,
      avatar: dataout.avatar,
      discriminator: dataout.discriminator,
      code: json.access_token,
      timestamp: Date.now()
    })

    res.redirect(`${process.env.URL}/profile?userid=${dataout.id}`)

  })
}))

app.get("/spotifyCallback", catchAsync(async (req, res) => {
  if (!req.query.code) throw new Error("NoCodeProvided")
  const code = req.query.code
  const creds = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)

  const params = new URLSearchParams()
  params.append("grant_type", "authorization_code")
  params.append("code", code)
  params.append("redirect_uri", "http://73.194.182.148:4898/spotifyCallback")
  
  const response = await fetch(`https://accounts.spotify.com/api/token`,
    {
      method: "POST",
      body: params,
      headers: {
        Authorization: `Basic ${creds}`
      }
    })
  const json = await response.json()

  await userdata.findOne({ userID: userIDS[0] }, async (err, user) => {
    if (err) throw new Error("DB could not find users [spot]")

    await userdata.findOneAndUpdate({ userID: userIDS[0] }, {$set:{"spotify": 
    {
      access_token: json.access_token,
      refresh_token: json.refresh_token
    }}})

    res.redirect(`${process.env.URL}/profile?spotify=true`)

  })
}))

app.get("/profile", async (req, res) => {
  let userid = req.query.userid || null
  let spotify = req.query.spotify || null

  if (userid && !req.cookies.discordLogin) res.cookie("discordLogin", userid, {expire: 86400000 + Date.now()})
  if (spotify && !req.cookies.spotifyLogin) res.cookie("spotifyLogin", spotify, {expire: 86400000 + Date.now()})

  res.render("profile", {
    title: "Spotify Bot"
  })
})

app.listen(4898, () => {
  console.info('Running on port 4898');
})