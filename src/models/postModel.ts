// src/models/post.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
    title: string;
    content: string;
    author: mongoose.Types.ObjectId; // User modeline referans
    comments: mongoose.Types.ObjectId[]; // Comment modeline referans dizisi
    createdAt: Date;
}

const PostSchema: Schema<IPost> = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', // 'User' modeline bağlıyoruz
        required: true 
    },
    comments: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Comment' // 'Comment' modeline bağlıyoruz
    }],
    createdAt: { type: Date, default: Date.now }
});

const PostDB = mongoose.model<IPost>('Post', PostSchema);
export default PostDB;