const { MessageEmbed } = require("discord.js")

exports.run = async (message) => {
  let helpEmbed = new MessageEmbed()
    .setTitle("Help")
    .setColor(message.member.displayHexColor)
    .addField("General", "`current`, `playlists`, `spotify`")
    .addField("Spotify Premium", "`play`, `pause`")
    .addField("Util", "`help`, `profile`, `update`")

  message.channel.send(helpEmbed)
}