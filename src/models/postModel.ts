// src/models/postModel.ts
import mongoose, { Document, Schema } from 'mongoose';

// Kategori Enum'ı (validasyon veya controller'larda kullanılabilir, schema'da doğrudan enum kullanmayacağız)
export enum PostCategory {
    TEKNOLOJI = 'Teknoloji',
    BILIM = 'Bilim',
    YAPAY_ZEKA = 'Yapay Zekâ',
    KULTUR = 'Kültür',
    GUNDEM = 'Gündem',
    DIGER = 'Diğer'
}

// Interface'i güncelleyelim: Kategori tipi ObjectId olacak, createdAt/updatedAt eklenecek
export interface IPost extends Document {
    title: string;
    content: string;
    imageUrl?: string;
    category: mongoose.Types.ObjectId; // Referans için ObjectId kullanacağız
    author: mongoose.Types.ObjectId;
    comments: mongoose.Types.ObjectId[];
    createdAt?: Date; // timestamps: true ile otomatik gelecek
    updatedAt?: Date; // timestamps: true ile otomatik gelecek
}

const PostSchema: Schema<IPost> = new Schema({
    title: {
        type: String,
        required: true,
        // API'den gelen eklemeler (isteğe bağlı, validasyonla da yapılabilir)
        // minlength: 2,
        // trim: true
    },
    content: {
        type: String,
        required: true,
        // API'den gelen eklemeler (isteğe bağlı, validasyonla da yapılabilir)
        // minlength: 2
    },
    imageUrl: {
        type: String,
        required: false
    },
    category: { // Kategori alanını referans olarak güncelledik
        type: Schema.Types.ObjectId,
        ref: 'Category', // Ayrı bir Category modeline referans verecek
        required: true
        // default veya enum kaldırıldı, çünkü referans kullanıyoruz.
        // Kategori varlığı kontrolü servis katmanında yapılmalı.
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User', // 'User' modeline referans
        required: true
    },
    comments: [{ // Yorumlar dizi olarak kalıyor
        type: Schema.Types.ObjectId,
        ref: 'Comment' // 'Comment' modeline referans
    }]
    // createdAt manuel tanımı kaldırıldı
},
{
    timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler ve yönetir (API modelinden alındı)
});

const PostDB = mongoose.model<IPost>('Post', PostSchema); // Model adı 'Post' olarak kalıyor

export default PostDB;