import mongoose, { Document, Schema } from "mongoose";

// Rolleri tanımlamak için bir enum kullanmak en iyi pratiktir.
export enum UserRole {
    ADMIN = 'Admin',
    USER = 'User'
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole; // 'role' alanı eklendi
    date?: Date;
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
    date: {
        type: Date,
        default: Date.now
    }
});

const UserDB = mongoose.model<IUser>('User', UserSchema);

export default UserDB;