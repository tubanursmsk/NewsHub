import { Request, Response, NextFunction } from 'express';
import * as commentService from '../../services/web/commentService';

/**
 * Yeni bir yorum oluşturma isteğini işler.
 */
export const handleCreateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text } = req.body; // Formdan gelen yorum metni
        const postId = req.params.id; // URL'den post ID'si (/posts/:id/comment)
        const authorId = req.session.userId; // Session'dan yorum yazarının ID'si

        // Session kontrolü (isAuthenticated zaten yapıyor ama ekstra güvenlik)
        if (!authorId) {
            throw new Error("Yorum yapmak için giriş yapmalısınız.");
        }

        // Basit validasyon: Yorum metni boş olamaz
        if (!text || text.trim() === '') {
            // Hata durumunda sayfayı yeniden yükleyebiliriz
            // Veya bir hata mesajını flash mesaj olarak gönderebiliriz (daha sonra eklenebilir)
            console.warn(`Boş yorum denemesi: postId=${postId}, userId=${authorId}`);
            return res.redirect(`/posts/${postId}`); // Aynı sayfaya geri dön
        }

        // Servisi çağırarak yorumu oluştur
        await commentService.createComment(text.trim(), authorId, postId);

        // Başarılı olursa, kullanıcıyı aynı post detay sayfasına geri yönlendir
        // Bu sayede eklediği yorumu hemen görebilir.
        res.redirect(`/posts/${postId}`);

    } catch (error) {
        // Hata olursa genel hata yöneticisine gönder
        next(error);
    }
};

/**
 * YENİ FONKSİYON
 * Bir yorum silme isteğini işler.
 */
export const handleDeleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Rotadan hem post hem de comment ID'sini alıyoruz
        const { postId, commentId } = req.params;

        // Servisi çağırarak yorumu sil
        await commentService.deleteComment(commentId);

        // Başarılı silme sonrası kullanıcıyı tekrar aynı yazı detay sayfasına yönlendir.
        res.redirect(`/posts/${postId}`);

    } catch (error) {
        // Hata olursa genel hata yöneticisine gönder
        next(error);
    }
};

// Yorum silme fonksiyonu (handleDeleteComment) daha sonra buraya eklenecek