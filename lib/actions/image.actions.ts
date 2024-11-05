/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { revalidatePath } from "next/cache"
import { ConnectToDatabase } from "../database/mongoose"
import { handleError } from "../utils"
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

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
        if(!image) {
            throw new Error("Image not found")
        }
        return JSON.parse(JSON.stringify(image))
    } catch (error) {
        handleError(error)
    }
}