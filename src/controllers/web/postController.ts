import { Request, Response, NextFunction } from 'express';
import * as postService from '../../services/web/postService'; 
import { PostCategory } from '../../models/postModel';

/**
 * Anasayfayı render eder. Veritabanından tüm postları çeker ve view'a gönderir.
 */
export const showHomePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await postService.getAllPosts(); 
        res.render('home', { posts: posts }); 
    } catch (error) {
        next(error); // Hata yöneticisine gönder
    }
};

/**
 * Yeni post oluşturma formunu gösterir.
 * Kategorileri view'a gönderir.
 */
export const showNewPostForm = (req: Request, res: Response) => {
    try {
        res.render('posts/new', { 
            error: null,
            // YENİ: Kategorileri dropdown için gönder
            categories: Object.values(PostCategory), 
            oldInput: { title: '', content: '', category: '' } // oldInput'a category ekle
        });
    } catch (e: any) {
        console.error("showNewPostForm EJS render error:", e);
        res.status(500).send("Sayfa yüklenirken bir hata oluştu: " + e.message);
    }
};




/**
 * Yeni post oluşturma formundan gelen veriyi, resmi ve kategoriyi işler.
 */
export const handleCreatePost = async (req: Request, res: Response, next: NextFunction) => {
    
    // ======== HATA AYIKLAMA: req.body'yi KONSOLA YAZDIR ========
    console.log("--- handleCreatePost Başladı ---");
    console.log("req.body:", req.body); 
    console.log("req.file:", (req as any).file); // req.file'ı da görelim
    // ==========================================================

    try {
        // YENİ: req.body tanımsızsa erken hata ver
        if (!req.body) {
            console.error("Hata: req.body tanımsız geldi!");
            throw new Error("Form verileri alınamadı.");
        }

        const { title, content, category } = req.body; 
        const authorId = req.session.userId;
        
        // Basit validasyon (kategori için de kontrol eklendi)
        if (!title || !content || !category || title.trim() === '' || content.trim() === '' || category.trim() === '') {
             return res.status(400).render('posts/new', {
                 error: "Başlık, kategori ve içerik alanları boş bırakılamaz.",
                 categories: Object.values(PostCategory), // Hata durumunda kategorileri tekrar gönder
                 oldInput: { title, content, category } // Hata durumunda girilenleri geri gönder
             });
        }

      // YENİ: Yüklenen dosyanın adını al (Daha kısa Tip İddiası)
        let imageUrl: string | undefined = undefined;
        if ((req as any).file) { 
            imageUrl = (req as any).file.filename; 
        }

        // Servise category'yi de gönder
        await postService.createPost(title, content, authorId, category, imageUrl); 
        res.redirect('/dashboard'); 
    
    } catch (error) {
         if (error instanceof Error && error.message.startsWith('Hata: Sadece resim dosyaları')) {
             return res.status(400).render('posts/new', { 
                 error: error.message,
                 categories: Object.values(PostCategory), // Hata durumunda kategorileri tekrar gönder
                 oldInput: req.body // Hata durumunda tüm girilenleri geri gönder
            });
         }
         res.status(500).render('posts/new', {
             error: (error instanceof Error) ? error.message : "Yazı kaydedilirken bilinmeyen bir hata oluştu.",
             categories: Object.values(PostCategory), // Hata durumunda kategorileri tekrar gönder
             oldInput: req.body // Hata durumunda tüm girilenleri geri gönder
         });
    }
};

// Diğer post kontrolör fonksiyonları (showDashboard, showPostDetail vb.) daha sonra buraya eklenecek