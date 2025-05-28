import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { channelId } = req.params

    if(!channelId.trim()){
        throw new ApiError(400, "Channel id is required")
    }

    const channelExist = await User.findById(channelId)
    if(!channelExist){
        throw new ApiError(400, "Channel not found")
    }

    const videos = await Video.find({ owner: channelId })

    const totalVideos = videos.length
    const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0)

    const videosId = videos.map(video => video._id)
    const totalLike = await Like.countDocuments({ video: { $in: videosId }})

    const totalSubscriber = await Subscription.countDocuments({ channel: channelId})

    const stats = {
        totalVideos,
        totalViews,
        totalLike,
        totalSubscriber
    }

    return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { channelId } = req.params

    if(!channelId.trim()){
        throw new ApiError(400, "Channel id is required")
    }
    
    const channelExist = await User.findById(channelId)
    if(!channelExist){
        throw new ApiError(400, "Channel not found")
    }
    
    const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 })

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos are fetched successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}
