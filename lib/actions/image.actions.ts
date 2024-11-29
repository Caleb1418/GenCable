/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { revalidatePath } from "next/cache"
import { ConnectToDatabase } from "../database/mongoose"
import { handleError } from "../utils"
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

import { v2 as cloudinary } from 'cloudinary'

const populateUser = (query: any) => {
    return query.populate({
        path: 'author',
        model: User,
        select: '_id firstName lastName'
    })
}

//ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
    try {
        await ConnectToDatabase();
        const author = await User.findById(userId);
        if (!author) {
            throw new Error("Author not found")
        }
        const newImage = await Image.create({
            ...image,
            author: author._id
        })
        revalidatePath(path);
        return JSON.parse(JSON.stringify(newImage))
    } catch (error) {
        handleError(error)
    }
}

//Update image
export async function updateImage({ image, userId, path }: UpdateImageParams) {
    try {
        await ConnectToDatabase();

        const imageToUpdate = await Image.findById(image._id);
        if (!imageToUpdate || imageToUpdate.author.toString() !== userId) {
            throw new Error("Image not found or not authorized")
        }
        const updatedImage = await Image.findByIdAndUpdate(image._id, image, { new: true })
        revalidatePath(path);
        return JSON.parse(JSON.stringify(updatedImage))
    } catch (error) {
        handleError(error)
    }
}

//DELETE IMAGE
export async function deleteImage(imageId: string) {
    try {
        await ConnectToDatabase();
        await Image.findByIdAndDelete(imageId);

    } catch (error) {
        handleError(error)
    } finally {
        redirect('/')
    }
}


//Get image
export async function getImageById(imageId: string) {
    try {
        await ConnectToDatabase();
        const image = await populateUser(Image.findById(imageId))
        if (!image) {
            throw new Error("Image not found")
        }
        return JSON.parse(JSON.stringify(image))
    } catch (error) {
        handleError(error)
    }
}

//Get all images
export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: { limit?: number, page: number, searchQuery?: string }) {
    try {
        await ConnectToDatabase();

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        });

        let expression = 'folder=genCable'

        if (searchQuery) {
            expression += `AND ${searchQuery}`
        }

        const { resources } = await cloudinary.search.
            expression(expression)
            .execute();

        const resourceIds = resources.map((resource: any) => resource.public_id);

        let query = {};

        if (searchQuery) {
            query = {
                publicId: { $in: resourceIds },
            }
        }

        const skipAmount = (Number(page) - 1) * Number(limit);

        const images = await populateUser(Image.find(query))
            .sort({ updatedAt: -1 })
            .skip(skipAmount)
            .limit(limit);


        const totalImages = await Image.find(query).countDocuments();
        const savedImages = await Image.find().countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPage: Math.ceil(totalImages / limit),
            savedImages
        }
    } catch (error) {
        handleError(error)
    }
}