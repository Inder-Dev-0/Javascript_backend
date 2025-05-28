import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if(!videoId){
        throw new ApiError(400, "Invalid video id")
    }

    const comment = await Comment.find({ video: videoId})
        .sort({ createdAt: -1})
        .skip((page - 1) * limit)
        .limit(Number(limit))
    
    return res
    .status(200)
    .json( new ApiResponse(200, comment, "All comment fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body
    const { videoId } = req.params

    if(!content.trim()){
        throw new ApiError(400, "Content is required")
    }

    const addComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    const commentAdded = await Comment.findById(addComment._id)

    if(!commentAdded){
        throw new ApiError( 500, "Something went wrong while uploading comment")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, commentAdded, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body 

    if(!content?.trim()){
        throw new ApiError(400, "Content is required")
    }

    const editComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: { content }
        },
        { new: true}
    )

    if(!editComment){
        throw new ApiError(400, "Comment is not found")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, editComment, "Comment update successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if(!commentId){
        throw new ApiError(400, "Invalid comment Id")
    }

    const deleteComment = await Comment.findByIdAndDelete(commentId)

    if(!deleteComment) {
        throw new ApiError(400, "Comment not found")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, deleteComment, "comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}