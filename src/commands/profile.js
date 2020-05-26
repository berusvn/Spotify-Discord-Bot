const { MessageEmbed } = require("discord.js")

exports.run = async (message, user) => {

  let discordLinked
  let spotifyLinked

  if (user) {
    discordLinked = "✅"
    if (user.spotify) {
      spotifyLinked = "✅"
    } else {
      spotifyLinked = "❎"
    }
  } else {
    discordLinked = "❎"
    spotifyLinked = "❎"
  }

  let profileEmbed = new MessageEmbed()
    .setAuthor(message.author.username, message.author.avatarURL())
    .setTitle("Profile")
    .setColor(message.member.displayHexColor)
    .setDescription(`Linked Discord? ${discordLinked}\nLinked Spotify? ${spotifyLinked}`)

  message.channel.send(profileEmbed)
}