import { Request, Response, NextFunction } from 'express';
import * as commentService from '../../services/web/commentService';
import { validationResult } from 'express-validator'; 
import * as postService from '../../services/web/postService'; // Post bilgilerini tekrar çekmek için

/**
 * Yeni bir yorum oluşturma isteğini işler (Validasyonlu).
 */
export const handleCreateComment = async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.id; // URL'den post ID'si
    const authorId = req.session.userId; // Session'dan yorum yazarının ID'si
    const { text } = req.body; // Formdan gelen yorum metni

    // 1. Validasyon sonuçlarını kontrol et
    const errors = validationResult(req);

    // 2. Eğer validasyon hatası varsa...
    if (!errors.isEmpty()) {
        try {
            // Hata mesajını göstermek için post ve mevcut yorumları TEKRAR çekmemiz gerekiyor.
            const [post, comments] = await Promise.all([
                postService.getPostById(postId),
                commentService.getCommentsByPostId(postId)
            ]);

            if (!post) { // Post bulunamazsa 404
                 const err: any = new Error("Yorum yapılacak yazı bulunamadı."); err.status = 404; return next(err);
            }

            // Detay sayfasını, validasyon hataları ve girilen eski yorum metniyle tekrar render et
            return res.status(400).render('posts/detail', {
                post: post,
                comments: comments,
                commentErrors: errors.array(), // Validasyon hatalarını farklı bir isimle gönderelim
                oldCommentInput: text, // Girilen eski yorumu geri gönder
                error: null, // Genel hata olmadığı için
                activePage: 'post'
            });
        } catch (fetchError) {
             // Post veya yorumları çekerken hata olursa genel yöneticiye gönder
            return next(fetchError);
        }
    }

    // 3. Validasyon hatası yoksa devam et...
    if (!authorId) { /* ... (giriş kontrolü aynı) ... */ }

    try {
        // Servisi çağırarak yorumu oluştur
        await commentService.createComment(text.trim(), authorId, postId);
        // Başarılı olursa aynı post detay sayfasına geri yönlendir
        res.redirect(`/posts/${postId}`);
    } catch (error) {
        // Servis hatası olursa genel hata yöneticisine gönder
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