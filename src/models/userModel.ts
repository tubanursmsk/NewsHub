import mongoose, { Document, Schema } from "mongoose";

// Rolleri tanımlamak için bir enum kullanmak en iyi pratiktir.
export enum UserRole {
    ADMIN = 'Admin',
    USER = 'User'
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string; // Bu alanı hash'lenmiş parolayı saklayacak şekilde kullanacağız
    role: UserRole; // 'role' alanı eklendi
    createdAt?: Date; // Alan adını 'createdAt' olarak değiştirmek daha standart
}

const UserSchema: Schema<IUser> = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { // 'role' şemaya eklendi
        type: String,
        enum: Object.values(UserRole), // Sadece 'Admin' veya 'User' olabilir
        default: UserRole.USER // Varsayılan rol 'User' olarak ayarlandı
    },
    createdAt: { // Alan adı 'createdAt' ve varsayılan değer 'Date.now' olarak güncellendi
        type: Date,
        default: Date.now // MongoDB'nin kendi zaman damgasını kullanmak daha iyi
    }
});

const UserDB = mongoose.model<IUser>('User', UserSchema);

export default UserDB;