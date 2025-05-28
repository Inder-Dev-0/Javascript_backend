import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const currentUserId = req.user?._id
    // TODO: toggle subscription

    if(!channelId){
        throw new ApiError(400, "Channel ID is required")
    }

    if (channelId === String(currentUserId)) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne(
        {
            subscriber: currentUserId,
            channel: channelId
        }
    )

    let message = ''
    if(existingSubscription){
        await Subscription.findByIdAndDelete(existingSubscription._id)
        message = 'Unsubscribed Successfully'
    } else {
        await Subscription.create({
            subscriber: currentUserId,
            channel: channelId
        })
        message = 'Subscribed successfully'
    }

    return res
    .status(200)
    .json(new ApiResponse(200, null, message))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if(!channelId){
        throw new ApiError(400, "Channel ID is required")
    }

    const subscriber = await Subscription.find({ channel: channelId}).populate("subscriber", "-password")

    return res
    .status(200)
    .json(new ApiResponse(200, subscriber, "Subscriber list fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    if(!subscriberId){
        throw new ApiError(400, "Subscriber ID is required")
    }

    const channel = await Subscription.find({ subscriber: subscriberId}).populate("channel", "-password")

    return res
    .status(200)
    .json(new ApiResponse(200, channel, "Channel list fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}