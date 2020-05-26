exports.run = async (message, user, spotifyUsers) => {
  if (user) {
    if (user.spotify) {
      if (!spotifyUsers[message.author.id]) {
        spotifyUsers[message.author.id] = new Spotify.Client(user.spotify, message.author.id)
        message.channel.send(`<@${message.author.id}>, your profile has been updated!`)
      } else {
        message.channel.send(`<@${message.author.id}>, no need to update your profile`)
      }
    }
  }
}