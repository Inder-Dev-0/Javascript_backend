import { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: add video to playlist
    const { playlistId } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    if (playlist.video.includes(videoId)) {
        return res
            .status(200)
            .json(new ApiResponse(400, "Video is already in playlist"))
    }

    playlist.video.push(videoId)
    await playlist.save()

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist successfully"))
})

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist

    if (
        [name, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist is not found")
    }

    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletePlaylist) {
        throw new ApiError(400, "Something went Wrong while deleting playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletePlaylist, "Playlist deleted successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlist

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    const userplaylists = await Playlist.find({ owner: userId })

    if (userplaylists === 0) {
        throw new ApiError(400, "No playlists found for the user")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userplaylists, "User playlist fetched successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    //TODO: remove video from playlist
    const { playlistId, videoId } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist not found")
    }

    if (!playlist.video.includes(videoId)) {
        return res
            .status(200)
            .json(new ApiResponse(400, "Video is not in playlist"))
    }

    playlist.video = playlist.video.filter(id => id.toString() !== videoId)
    await playlist.save()

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed to playlist successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: update playlist
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist id is required")
    }
    
    if (
        [name, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const playlistUpdated = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        { new: true }
    )

    return res
    .status(200)
    .json( new ApiResponse(200, playlistUpdated, "Playlist updated successfully"))
})

export {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist
}