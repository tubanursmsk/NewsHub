import mongoose, { Document, Schema } from 'mongoose';

// Kategorileri bir enum olarak tanımlamak daha güvenli olabilir
export enum PostCategory {
    TEKNOLOJI = 'Teknoloji',
    BILIM = 'Bilim',
    YAPAY_ZEKA = 'Yapay Zekâ',
    KULTUR = 'Kültür',
    GUNDEM = 'Gündem',
    DIGER = 'Diğer' // Varsayılan veya tanımsız için
}

export interface IPost extends Document {
    title: string;
    content: string;
    imageUrl?: string; 
    category: PostCategory; // YENİ: Kategori alanı
    author: mongoose.Types.ObjectId; 
    comments: mongoose.Types.ObjectId[]; 
    createdAt: Date;
}

const PostSchema: Schema<IPost> = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: false }, 
    category: { // YENİ: Şemaya eklendi
        type: String,
        enum: Object.values(PostCategory), // Sadece enum'daki değerler geçerli
        required: true, // Kategori seçimi zorunlu olsun
        default: PostCategory.DIGER // Varsayılan kategori
    },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    comments: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Comment' 
    }],
    createdAt: { type: Date, default: Date.now }
});

const PostDB = mongoose.model<IPost>('Post', PostSchema);
export default PostDB;