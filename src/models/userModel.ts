import mongoose, { Document, Schema } from "mongoose";
import { eRoles } from "../utils/eRoles";



export interface IUser extends Document {
    name: string;
    email: string;
    password: string; // Bu alanı hash'lenmiş parolayı saklayacak şekilde kullanacağız
    roles: eRoles; // 'role' alanı eklendi
    jwt?: string,
    createdAt?: Date; // Alan adını 'createdAt' olarak değiştirmek daha standart
}

const UserSchema: Schema<IUser> = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { // 'role' şemaya eklendi
        type: String,
        default: eRoles.User // Varsayılan rol 'User' olarak ayarlandı
    },
    jwt: {type: String},
    createdAt: { // Alan adı 'createdAt' ve varsayılan değer 'Date.now' olarak güncellendi
        type: Date,
        default:  () => {
            const now = new Date();
            return now.setHours(now.getHours() + 3)
        } // MongoDB'nin kendi zaman damgasını kullanmak daha iyi
    }
})

const UserDB = mongoose.model<IUser>('User', UserSchema)

export default UserDB