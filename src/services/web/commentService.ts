import CommentDB, { IComment } from '../../models/commentModel'; // commentModel'i import et
import PostDB from '../../models/postModel';
import mongoose from 'mongoose';

/**
 * Belirli bir posta ait tüm yorumları, yazar bilgileriyle birlikte getirir.
 * En yeniden en eskiye doğru sıralar.
 * @param postId Yorumların getirileceği post'un ID'si
 * @returns Yorumların dizisi
 * @throws Hata: Veritabanı hatası varsa
 */
export const getCommentsByPostId = async (postId: string): Promise<IComment[]> => {
    try {
        // Post ID'sine göre yorumları bul, 'author' alanını User modelinden 'name' ile doldur,
        // ve createdAt alanına göre tersten sırala.
        const comments = await CommentDB.find({ post: postId })
            .populate('author', 'name') // Yorum yazarının sadece adını getir
            .sort({ createdAt: -1 }); // En yeni yorum en üstte
        return comments;
    } catch (error) {
        console.error("Posta ait yorumlar getirilirken hata:", error);
        throw new Error("Yorumlar yüklenirken bir sorun oluştu.");
    }
};

/**
 * YENİ FONKSİYON
 * Yeni bir yorum oluşturur ve ilgili posta ekler.
 * @param text Yorumun içeriği
 * @param authorId Yorumu yapan kullanıcının ID'si (session'dan)
 * @param postId Yorumun yapıldığı post'un ID'si (URL'den)
 * @returns Oluşturulan yorum nesnesi
 * @throws Hata: Veritabanı hatası varsa
 */
export const createComment = async (text: string, authorId: string, postId: string): Promise<IComment> => {
    try {
        // 1. Yeni yorum dökümanını oluştur
        const newComment = new CommentDB({
            text,
            author: authorId,
            post: postId
        });
        // Yorumu kaydet
        const savedComment = await newComment.save();

        // 2. Kaydedilen yorumun ID'sini ilgili post'un 'comments' dizisine ekle
        // ($push operatörü, dizinin sonuna eleman ekler)
        await PostDB.findByIdAndUpdate(postId, {
            $push: { comments: savedComment._id }
        });

        // Kaydedilen yorumu döndür (belki controller'da lazım olur)
        return savedComment;

    } catch (error) {
        console.error("Yorum oluşturulurken veritabanı hatası:", error);
        throw new Error("Yorum kaydedilirken bir sorun oluştu.");
    }
};

/**
 * YENİ FONKSİYON
 * Bir yorumu veritabanından siler ve ilişkili olduğu posttan kaldırır.
 * @param commentId Silinecek yorumun ID'si
 * @throws Hata: Yorum bulunamazsa veya veritabanı hatası varsa
 */
export const deleteComment = async (commentId: string): Promise<void> => {
    try {
        // ID'nin geçerli olup olmadığını kontrol et
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            throw new Error("Geçersiz yorum ID'si.");
        }

        // 1. Önce yorumu bulup hangi posta ait olduğunu öğrenelim (Post'tan referansı silmek için gerekli).
        const comment = await CommentDB.findById(commentId);
        if (!comment) {
            throw new Error("Silinecek yorum bulunamadı.");
        }
        const postId = comment.post; // Post ID'sini al

        // 2. Yorumu 'comments' koleksiyonundan sil.
        const deleteResult = await CommentDB.findByIdAndDelete(commentId);
        if (!deleteResult) { // Eğer silme başarısız olursa (örn: yorum zaten silinmişse)
             throw new Error("Yorum silinemedi veya zaten silinmiş.");
        }


        // 3. Yorumun referansını 'posts' koleksiyonundaki ilgili dökümanın 'comments' dizisinden kaldır.
        // MongoDB'nin $pull operatörü, diziden belirtilen elemanı çıkarır.
        await PostDB.findByIdAndUpdate(postId, {
            $pull: { comments: commentId }
        });
        
        console.log(`Yorum (${commentId}) ve Post (${postId}) referansı silindi.`); // Loglama

    } catch (error) {
        console.error("Yorum silinirken hata:", error);
        throw new Error("Yorum silinirken bir sorun oluştu.");
    }
};
