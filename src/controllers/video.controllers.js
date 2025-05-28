import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const filter = {}

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    if (userId) {
        filter.user = userId
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortType === 'asc' ? 1 : -1;

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit))

    const total = await Video.countDocuments(filter)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    videos,
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / limit)
                }
            )
        )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    console.log("Title: ", title)
    console.log("discription: ", description)

    if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    const videoUpload = await uploadOnCloudinary(videoLocalPath)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoUpload) {
        throw new ApiError(400, "Video file is required")
    }

    const video = await Video.create({
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload?.url || "",
        title: title,
        description: description,
        duration: videoUpload.duration,
        owner: req.user?._id
    })
    console.log("User: ", video.owner)

    const createdVideo = await Video.findById(video._id)

    if (!createdVideo) {
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdVideo, "Video is uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId || !videoId?.trim) {
        throw new ApiError(400, "videoId is missing")
    }

    console.log(videoId)

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId format")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 }
        },
        { new: true }
    ).populate("owner")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    //TODO: update video details like title, description, thumbnail

    const thumbnailLocalPath = req.file?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is not found")
    }

    if (!title?.trim() && !description?.trim()) {
        throw new ApiError(400, "All fields are requried")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail.url) {
        throw new ApiError(400, 'Error while uploading thumbnail')
    }
    const detailsUpdated = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
                title: title,
                description: description
            }
        },
        { new: true }
    )

    console.log(detailsUpdated)

    return res
        .status(200)
        .json(new ApiResponse(200, detailsUpdated, "All details are updated"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId) {
        throw new ApiError(400, "Invalid video id")
    }

    let videoDelete
    try {
        videoDelete = await Video.findByIdAndDelete(videoId)
    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting the video")
    }

    if (!videoDelete) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videoDelete, "Video is deleted"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const status = !video.isPublished

    const publishStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: status
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, publishStatus, `Video is now ${status ? "published" : "unpublished"}`))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
