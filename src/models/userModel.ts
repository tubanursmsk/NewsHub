import mongoose, { Document, Schema } from "mongoose";
import { eRoles } from "../utils/eRoles"; // eRoles dosyasını doğru yoldan import ettiğinizden emin olun

// Interface'i güncelleyelim: 'role' yerine 'roles' (dizi) ve createdAt/updatedAt
export interface IUser extends Document {
    name: string;
    email: string;
    password: string; // Hash'lenmiş parola
    roles: eRoles[]; // Rolleri dizi olarak tutacağız
    jwt?: string;     // API için opsiyonel JWT alanı
    createdAt?: Date; // timestamps: true ile otomatik gelecek
    updatedAt?: Date; // timestamps: true ile otomatik gelecek
}

const UserSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
        // min: 6 kaldırıldı, email validasyonu validator ile yapılmalı
    },
    password: {
        type: String,
        required: true
    },
    roles: { // 'role' yerine 'roles' dizisi kullanıyoruz
        type: [String], // Mongoose'da dizi tanımı
        enum: [eRoles.Admin, eRoles.User], // Sadece eRoles'daki değerler geçerli
        default: [eRoles.User] // Varsayılan rolü dizi içinde User olarak ayarla
    },
    jwt: { // API tarafı için gerekebilir
        type: String,
        required: false // Zorunlu değil
    }
},
{
    timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler ve yönetir
});

const UserDB = mongoose.model<IUser>('User', UserSchema);

export default UserDB;