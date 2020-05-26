const { MessageEmbed } = require("discord.js")

exports.run = async (message, spotifyUsers) => {
  let spotifyPause = await spotifyUsers[message.author.id].pauseTrack()

  let pauseEmbed = new MessageEmbed()
  if (spotifyPause.succuss) {
    pauseEmbed.setColor("#1db954")
    pauseEmbed.setDescription("Song has been paused")
  } else if (spotifyPause.premium) {
    pauseEmbed.setColor("#FF0000")
    pauseEmbed.setDescription("You need Spotify Premium to use this command")
  } else {
    pauseEmbed.setColor("#FF0000")
    pauseEmbed.setDescription("Song has not been paused :/")
  }

  message.channel.send(pauseEmbed)

}