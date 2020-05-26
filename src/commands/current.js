const { MessageEmbed } = require("discord.js")
const ms = require("pretty-ms")

exports.run = async (message, spotifyUsers) => {

  let spotifyCurrent = await spotifyUsers[message.author.id].getUserCurrentlyPlayingTrack()

  let currentEmbed = new MessageEmbed()
  if (spotifyCurrent.error) {

    currentEmbed.setColor("#FF0000")
    currentEmbed.setDescription("Not currently listening to anything on Spotify")

    message.channel.send(currentEmbed)

  } else {
    let artists = ""
    for (let i = 0; i < spotifyCurrent.item.artists.length; i++) {
      if (spotifyCurrent.item.artists.length-1 == i) {
        artists += spotifyCurrent.item.artists[i].name
      } else {
        artists += `${spotifyCurrent.item.artists[i].name}, `
      }
    }

    // scaling time
    const scaleTime = (number, max) => {
      return Math.round((11 - 1) * (number - 1) / (max - 1) + 1)
    }

    // getting the track display
    let trackBar = ""
    let trackCurrentTime = scaleTime(spotifyCurrent.progress_ms, spotifyCurrent.item.duration_ms)
    for (let i = 1; i < 11; i++) {
      if (i === trackCurrentTime) {
        trackBar += "🔵"
      } else {
        trackBar += "▬"
      }
    }

    //getting the times
    let currentTime = `${ms(spotifyCurrent.progress_ms, {colonNotation: true}).split(".")[0]} `
    let fullTime = ` ${ms(spotifyCurrent.item.duration_ms, {colonNotation: true}).split(".")[0]}`
    

    currentEmbed.setThumbnail(await spotifyUsers[message.author.id].getTrackImage(spotifyCurrent.item.id))
    currentEmbed.setAuthor(artists, await spotifyUsers[message.author.id].getArtistsImage(spotifyCurrent.item.artists[0].id))
    currentEmbed.setTitle(spotifyCurrent.item.name)
    currentEmbed.setColor("#1db954")
    currentEmbed.setDescription(currentTime + trackBar + fullTime)

    message.channel.send(currentEmbed)
  }

}