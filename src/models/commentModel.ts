// src/models/commentModel.ts
import mongoose, { Document, Schema } from 'mongoose';

// Interface'i güncelleyelim: text -> content, API'den gelen ek alanlar
export interface IComment extends Document {
    content: string; // 'text' yerine 'content'
    author: mongoose.Types.ObjectId; // Yorumu yapan kullanıcı (web'deki gibi)
    postId: mongoose.Types.ObjectId; // Yorumun yapıldığı post ('post' yerine 'postId')
    isActive: boolean; // API'den eklendi: Yorum onay durumu
    like: number;      // API'den eklendi
    dislike: number;   // API'den eklendi
    lastUpdatedBy?: mongoose.Types.ObjectId; // API'den eklendi: Yorumu son güncelleyen admin/kullanıcı
    createdAt?: Date; // timestamps: true ile otomatik gelecek
    updatedAt?: Date; // timestamps: true ile otomatik gelecek
}

const CommentSchema: Schema<IComment> = new Schema({
    content: { // 'text' yerine 'content' kullanıldı ve API'den kısıtlamalar eklendi
        type: String,
        required: true,
        minlength: [3, 'Yorum en az 3 karakter olmalıdır.'],    // Validasyon mesajı eklendi
        maxlength: [1000, 'Yorum en fazla 1000 karakter olabilir.'] // Validasyon mesajı eklendi
    },
    author: { // Web modeliyle aynı
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: { // 'post' yerine 'postId' kullanıldı ve referans düzeltildi
        type: Schema.Types.ObjectId,
        ref: 'Post', // 'Post' modeline referans
        required: true
    },
    isActive: { // API'den eklendi
        type: Boolean,
        default: false // Varsayılan olarak yorumlar onay bekler
    },
    like: { // API'den eklendi
        type: Number,
        default: 0
    },
    dislike: { // API'den eklendi
        type: Number,
        default: 0
    },
    lastUpdatedBy: { // API'den eklendi (required: true kaldırıldı, ilk oluşturmada olmayabilir)
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
    // createdAt manuel tanımı kaldırıldı
},
{
    timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler ve yönetir
});

// API modelindeki pre-save kancası, timestamps: true varken updatedAt'i zaten yönettiği için kaldırıldı.
// Eğer updatedAt'i manuel olarak yönetmek istersen, timestamps: true'yu kaldırıp pre-save kancasını ekleyebilirsin.

const CommentDB = mongoose.model<IComment>('Comment', CommentSchema);
export default CommentDB;