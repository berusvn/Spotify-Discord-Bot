const { MessageEmbed } = require("discord.js")

exports.run = async (message, spotifyUsers) => {
  let spotifyPlay = await spotifyUsers[message.author.id].playTrack()

  let playEmbed = new MessageEmbed()
  if (spotifyPlay.succuss) {
    playEmbed.setColor("#1db954")
    playEmbed.setDescription("Song has been resumed")
  } else if (spotifyPlay.premium) {
    playEmbed.setColor("#FF0000")
    playEmbed.setDescription("You need Spotify Premium to use this command")
  } else {
    playEmbed.setColor("#FF0000")
    playEmbed.setDescription("Song has not been resumed :/")
  }

  message.channel.send(playEmbed)

}