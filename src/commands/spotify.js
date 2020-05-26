const { MessageEmbed } = require("discord.js")

exports.run = async (message, spotifyUsers) => {
  let spotifyProfile = await spotifyUsers[message.author.id].getUserProfile()
  let spotifyTops = await spotifyUsers[message.author.id].getUserTopArtistsAndTracks()

  let spotifyProfileEmbed = new MessageEmbed()
    .setAuthor(spotifyProfile.display_name, spotifyProfile.images[0].url, spotifyProfile.external_urls.spotify)
    .setColor(message.member.displayHexColor)
    .setDescription(`Followers: **${spotifyProfile.followers.total}**\nYour top 3 artist are: [${spotifyTops.items[0].name}](${spotifyTops.items[0].external_urls.spotify}), [${spotifyTops.items[1].name}](${spotifyTops.items[1].external_urls.spotify}), [${spotifyTops.items[2].name}](${spotifyTops.items[2].external_urls.spotify})`)

  message.channel.send(`***${message.author.username}'s*** Spotify Profile`, spotifyProfileEmbed)
}