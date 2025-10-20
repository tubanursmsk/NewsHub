import PostDB, { IPost } from '../../models/postModel'; 
import mongoose from 'mongoose';
import { PostCategory } from '../../models/postModel';
/**
 * Veritabanına yeni bir post oluşturur.
 * @param title Post başlığı
 * @param content Post içeriği
 * @param authorId Postu oluşturan kullanıcının ID'si (string olarak gelir)
 * @param category Post kategorisi
 * @param imageUrl Yüklenen resmin dosya adı (opsiyonel)
 * @returns Oluşturulan post nesnesi
 */
export const createPost = async (
    title: string, 
    content: string, 
    authorId: string, // Bu string olarak kalacak
    category: PostCategory, 
    imageUrl?: string
): Promise<IPost> => { 
    try {
        // newPostData objesinin tipini belirtmeye gerek yok, Mongoose halleder.
        const newPostData = { 
            title,
            content,
            author: authorId, // String ID'yi doğrudan atayın
            category,
            imageUrl: imageUrl || undefined // Eğer imageUrl yoksa undefined olsun
        };
       
        const newPost = new PostDB(newPostData);
        return await newPost.save();
    } catch (error) {
        console.error("Post oluşturulurken veritabanı hatası:", error);
        if (error instanceof mongoose.Error.ValidationError) {
             throw new Error("Lütfen tüm zorunlu alanları doğru şekilde doldurun.");
        }
        throw new Error("Yazı kaydedilirken bir sorun oluştu.");
    }
};

/**
 * Veritabanındaki tüm postları, yazar bilgileriyle birlikte getirir.
 * En yeniden en eskiye doğru sıralar.
 * @returns Tüm postların dizisi
 */
export const getAllPosts = async (): Promise<IPost[]> => {
    try {
        const posts = await PostDB.find()
            .populate('author', 'name') 
            .sort({ createdAt: -1 }); 
        return posts;
    } catch (error) {
        console.error("Tüm postlar getirilirken hata:", error);
        throw new Error("Yazılar yüklenirken bir sorun oluştu."); 
    }
};

// Diğer post servis fonksiyonları (getPostById, updatePost, deletePost vb.)
// daha sonra buraya eklenecek.