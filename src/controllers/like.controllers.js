import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is required")
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    let message = "";
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        message = "Video unliked";
    } else {
        await Like.create({ video: videoId, likedBy: userId });
        message = "Video liked";
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, message));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    const userId = req.user?._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment id is required")
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    let message = "";
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        message = "Comment unliked";
    } else {
        await Like.create({ comment: commentId, likedBy: userId });
        message = "Comment liked";
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, message));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    const userId = req.user?._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is required")
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    let message = "";
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        message = "Tweet unliked";
    } else {
        await Like.create({ tweet: tweetId, likedBy: userId });
        message = "Tweet liked";
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, message));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Video id is required")
    }

    const likedVideos = await Like.findOne({ likedBy: userId }).populate('video');

    return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}