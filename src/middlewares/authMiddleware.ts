import { Request, Response, NextFunction } from 'express';
import PostDB from '../models/postModel';
import { UserRole } from '../models/userModel'; 

/**
 * Kullanıcının oturum açıp açmadığını kontrol eder.
 * Oturum açmamışsa giriş sayfasına yönlendirir.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    // Session'da userId varsa, kullanıcı giriş yapmış demektir.
    if (req.session.userId) {
        // İstek zincirindeki bir sonraki adıma geçmesine izin ver.
        next();
    } else {
        // Kullanıcı giriş yapmamış, onu giriş sayfasına yönlendir.
        res.redirect('/login');
    }
};

/**
 * YENİ FONKSİYON
 * Giriş yapan kullanıcının, işlem yapılan post'un sahibi olup olmadığını kontrol eder.
 */
export const isAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id; // URL'den post'un ID'sini al ( /posts/:id/edit gibi)
        const userId = req.session.userId; // Session'dan kullanıcının ID'sini al

        // Eğer postId veya userId yoksa (beklenmedik durum)
        if (!postId || !userId) {
            return res.status(400).send("Geçersiz istek.");
        }

        const post = await PostDB.findById(postId);

        // Post bulunamadıysa 404 hatası ver
        if (!post) {
            return res.status(404).render('error', { statusCode: 404, message: "Yazı bulunamadı.", layout: false });
        }

        // Post'un yazar ID'si (ObjectId) ile giriş yapan kullanıcının ID'si (string) eşleşiyor mu?
        if (post.author.toString() !== userId) {
            // Eşleşmiyorsa, yetkisi yok. 403 (Forbidden) hatası ver.
            return res.status(403).render('error', { statusCode: 403, message: "Bu işlem için yetkiniz bulunmamaktadır.", layout: false });
        }

        // Yetkisi var, bir sonraki adıma (kontrolöre) geçebilir.
        next();

    } catch (error) {
        // Genel bir hata olursa hata yöneticisine gönder
        next(error);
    }
};

/**
 * YENİ FONKSİYON
 * Giriş yapan kullanıcının bir yorumu silme yetkisi olup olmadığını kontrol eder.
 * Yetki kuralları:
 * 1. Kullanıcı 'Admin' ise silebilir.
 * 2. Kullanıcı yorumun yapıldığı post'un sahibi ise silebilir.
 */
export const canDeleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Rotadan post ID'sini alıyoruz (örn: /posts/:postId/comment/:commentId/delete)
        const { postId } = req.params; 
        const { userId, userRole } = req.session;

        // Session bilgisi yoksa (beklenmedik durum)
        if (!userId || !userRole) {
            return res.status(401).render('error', { statusCode: 401, message: "Bu işlem için giriş yapmalısınız.", layout: false });
        }

        // Kural 1: Eğer kullanıcı Admin ise, devam etmesine izin ver.
        if (userRole === UserRole.ADMIN) { // Enum kullanmak daha güvenli
            return next();
        }

        // Kural 2: Eğer kullanıcı post'un sahibi ise, devam etmesine izin ver.
        const post = await PostDB.findById(postId);
        // Post var mı VE postun yazarı giriş yapan kullanıcı mı?
        if (post && post.author.toString() === userId) {
            return next();
        }

        // Yukarıdaki kurallardan hiçbiri karşılanmıyorsa, yetkisi yoktur. 403 hatası ver.
        res.status(403).render('error', { statusCode: 403, message: "Bu yorumu silme yetkiniz bulunmamaktadır.", layout: false });

    } catch (error) {
        // Genel bir hata olursa hata yöneticisine gönder
        next(error);
    }
};