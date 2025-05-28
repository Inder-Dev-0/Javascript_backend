import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    const { userId } = req.params

    if (!content.trim()) {
        throw new ApiError(400, "Content is required")
    }

    const addTweet = await Tweet.create({
        content,
        owner: userId
    })

    const tweetAdded = await Tweet.findById(addTweet._id)

    if (!tweetAdded) {
        throw new ApiError(500, "Something went wrong while uploading tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweetAdded, "Tweet added successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!userId) {
        throw new ApiError(400, "User id is required")
    }

    const tweet = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "All tweet fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required")
    }

    const editTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: { content }
        },
        { new: true }
    )

    if (!editTweet) {
        throw new ApiError(400, "Tweet is not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, editTweet, "Tweet update successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!tweetId?.trim()) {
        throw new ApiError(400, "Invalid tweet Id")
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deleteTweet) {
        throw new ApiError(400, "Tweet not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deleteTweet, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
