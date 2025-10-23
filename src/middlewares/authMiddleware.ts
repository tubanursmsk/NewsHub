import { Request, Response, NextFunction } from 'express';
import PostDB from '../models/postModel'; // isAuthor ve canDeleteComment için gerekli
import { eRoles } from '../utils/eRoles'; // isAdmin ve canDeleteComment için gerekli
import mongoose from 'mongoose'; // isAuthor ve canDeleteComment içinde ObjectId kontrolü için (opsiyonel ama iyi)

/**
 * 1. isAuthenticated: Kullanıcı Giriş Yapmış mı?
 * Bir rotaya erişim için temel giriş kontrolü.
 * Giriş yapmamışsa /login'e yönlendirir.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
        next(); // Giriş yapmış, devam et
    } else {
        res.redirect('/login'); // Giriş yapmamış, login'e gönder
    }
};

/**
 * 2. isAdmin: Kullanıcı Admin mi?
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    
    // === HATA AYIKLAMA: Session'daki rolü ve beklenen rolü yazdır ===
    console.log("isAdmin Middleware Çalıştı.");
    console.log("Session Rolü (req.session.eRoles):", req.session.userRoles); 
    console.log("Beklenen Rol (eRoles.Admin):", eRoles.Admin);
    console.log("Admin Rolü Var Mı?:", req.session.userRoles?.includes(eRoles.Admin)); // ?.includes güvenli erişim sağlar
    // =============================================================

    if (req.session.userRoles && req.session.userRoles.includes(eRoles.Admin)) {
        console.log("Yetki verildi (Admin).");
        next(); 
    } else {
        console.log("Yetki REDDEDİLDİ.");
        res.status(403).render('error', {
            statusCode: 403,
            message: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
            layout: false
        });
    }
};

export const isAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id;
        const userId = req.session.userId;

        if (!postId || !userId || !mongoose.Types.ObjectId.isValid(postId)) {
             // Geçersiz ID veya session yoksa hata ver
            return res.status(400).render('error', { statusCode: 400, message: "Geçersiz istek.", layout: false });
        }

        const post = await PostDB.findById(postId);

        if (!post) {
            return res.status(404).render('error', { statusCode: 404, message: "Yazı bulunamadı.", layout: false });
        }

        if (post.author.toString() !== userId) {
            return res.status(403).render('error', { statusCode: 403, message: "Bu işlem için yetkiniz bulunmamaktadır.", layout: false });
        }

        next(); // Kullanıcı yazar, devam et

    } catch (error) {
        next(error); // Veritabanı vb. hatası olursa genel yöneticiye gönder
    }
};

/**
 * 4. canDeleteComment: Kullanıcı Yorumu Silebilir mi?
 * Bir yorumu silme yetkisini kontrol eder (Admin VEYA Post Sahibi).
 * '/posts/:postId/comment/:commentId/delete' gibi rotalarda kullanılır.
 * 'isAuthenticated' middleware'inden SONRA kullanılmalıdır.
 */
export const canDeleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId } = req.params;
        const { userId, userRoles } = req.session;

        // Kontrolde de 'userRoles' kullan
        if (!userId || !userRoles || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).render('error', { statusCode: 400, message: "Geçersiz istek veya kimlik doğrulama hatası.", layout: false });
        }

        // Kural 1: Admin ise direkt devam et
        //  'userRoles' kullan ve Array.includes ile kontrol et
        if (userRoles.includes(eRoles.Admin)) {
            return next();
        }

        // Kural 2: Post sahibi mi diye kontrol et
        const post = await PostDB.findById(postId);
        if (post && post.author.toString() === userId) {
            return next(); // Post sahibi, devam et
        }

        // Yetkisi yoksa 403 hatası ver
        res.status(403).render('error', { statusCode: 403, message: "Bu yorumu silme yetkiniz bulunmamaktadır.", layout: false });

    } catch (error) {
        next(error); // Veritabanı vb. hatası olursa genel yöneticiye gönder
    }
};