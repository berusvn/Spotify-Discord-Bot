const { MessageEmbed } = require("discord.js")

exports.run = async (message, spotifyUsers) => {
  let spotifyPlaylists = await spotifyUsers[message.author.id].getListOfUserPlaylists()
  
  let spotifyPlaylistsEmbed = new MessageEmbed()
    .setAuthor(message.author.username, message.author.avatarURL())
    .setColor(message.member.displayHexColor)
    .setDescription(spotifyPlaylists.total > 20 ? `Showing 20 of ${spotifyPlaylists.total} playlists` : `Showing ${spotifyPlaylists.total} playlists`)

  for (let i = 0; i < spotifyPlaylists.items.length; i++) {
    spotifyPlaylistsEmbed.addField(
      spotifyPlaylists.items[i].name,
      `${spotifyPlaylists.items[i].public ? `[Link](${spotifyPlaylists.items[i].external_urls.spotify})`: ''}\n${spotifyPlaylists.items[i].tracks.total} Songs`,
      true
    )
  }

  message.channel.send(spotifyPlaylistsEmbed)

}