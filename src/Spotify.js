const fetch = require("node-fetch")
const btoa = require("btoa")
const { URLSearchParams } = require("url")

let userdata
const getDB = (db) => {
  userdata = db
}

class Spotify {
  constructor(spotifyObj, userID) {
    this.spotifyObj = spotifyObj
    this.userID = userID
  }

  _getNewAccessToken = async () => {

    const params = new URLSearchParams()
    params.append("grant_type", "refresh_token")
    params.append("refresh_token", this.spotifyObj.refresh_token)

    let response = await fetch(`https://accounts.spotify.com/api/token`,
    {
      method: "POST",
      body: params,
      headers: {
        Authorization: `Basic ${btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`
      }
    }).then(res => res.json())
    
    await userdata.findOneAndUpdate({ userID: this.userID }, {$set:{"spotify.access_token": response.access_token}})

  }

  /**
   * Get the users Spotify user
   * @returns {Object} Spotify User Profile API (Get Current User's Profile)
   */
  getUserProfile = async () => {
    let userProfile = await fetch(`https://api.spotify.com/v1/me`, 
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.spotifyObj.access_token}`
      }
    }).then(res => res.json())
    if (userProfile.error) this._getNewAccessToken()

    return userProfile
  }

  /**
   * Get the users Spotify tops
   * @returns {Object} Spotify Personalization API (Get a User's Top Artists and Tracks)
   */
  getUserTopArtistsAndTracks = async () => {
    let userTops = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=3`, 
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.spotifyObj.access_token}`
      }
    }).then(res => res.json())
    if (userTops.error) this._getNewAccessToken()

    return userTops
  }

  /**
   * Gets the users Spotify playlists
   * @returns {Object} Spotify Playlists API (Get a List of Current User's Playlists)
   */
  getListOfUserPlaylists = async () => {
    let userPlaylists = await fetch(`https://api.spotify.com/v1/me/playlists`, 
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.spotifyObj.access_token}`
      }
    }).then(res => res.json())
    if (userPlaylists.error) this._getNewAccessToken()

    return userPlaylists
  }

  /**
   * Gets the users current Spotify playing track
   * @returns {Object} Player API (Get the User's Currently Playing Track)
   */
  getUserCurrentlyPlayingTrack = async () => {
    let userCurrentTrack = await fetch(`https://api.spotify.com/v1/me/player/currently-playing?market=us`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.spotifyObj.access_token}`
      }
    })
    if (userCurrentTrack.status === 401) await this._getNewAccessToken()

    // No Content
    if (userCurrentTrack.status === 204) {
      return {error: 204}
    }

    // OK
    if (userCurrentTrack.status === 200) {
      return userCurrentTrack.json()
    }

  }

  // -~-~-~-~-~-~-~-~-~-~-~-~-~-~ Little Functions -~-~-~-~-~-~-~-~-~-~-~-~-~-~

  /**
   * Get the Spotify Picture of a Track
   * @param {String} id The ID of the track
   * @returns {Url} Tracks API (Get a Track)
   */
  getTrackImage = async (id) => {
    let track = await fetch(`https://api.spotify.com/v1/tracks/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.spotifyObj.access_token}`
      }
    }).then(res => res.json())

    return track.album.images[0].url
  }

  /**
   * Get the Spotify Profile Picture of a Artist
   * @param {String} id 
   * @returns {Url} Artists API (Get an Artist)
   */
  getArtistsImage = async (id) => {
    let artist = await fetch(`https://api.spotify.com/v1/artists/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.spotifyObj.access_token}`
      }
    }).then(res => res.json())

    return artist.images[0].url
  }

  playTrack = async () => {
    let play = await fetch(`https://api.spotify.com/v1/me/player/play`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.spotifyObj.access_token}`
      }
    })

    return play.status === 204 ? {succuss: 204} : play.status === 403 ? {premium: 403} : {error: 404}
  }

  pauseTrack = async () => {
    let pause = await fetch(`https://api.spotify.com/v1/me/player/pause`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.spotifyObj.access_token}`
      }
    })

    return pause.status === 204 ? {succuss: 204} : pause.status === 403 ? {premium: 403} : {error: 404}
  }

}

module.exports = {
  Client: Spotify,
  getDB
}