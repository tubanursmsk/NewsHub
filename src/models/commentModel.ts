// src/models/comment.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    text: string;
    author: mongoose.Types.ObjectId; // Yorumu yapan kullanıcı
    post: mongoose.Types.ObjectId; // Yorumun yapıldığı post
    createdAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema({
    text: { type: String, required: true },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    post: { 
        type: Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true 
    },
    createdAt: { type: Date, default: Date.now }
});

const CommentDB = mongoose.model<IComment>('Comment', CommentSchema);
export default CommentDB;