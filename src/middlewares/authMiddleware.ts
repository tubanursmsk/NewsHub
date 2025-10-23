import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import NewsDB from '../models/newsModel';
import { eRoles } from '../utils/eRoles';

/**
 * 1. isAuthenticated — Kullanıcı giriş yapmış mı?
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
        return next(); // Giriş yapmış
    }
    return res.redirect('/login');
};

/**
 * 2. isAdmin — Kullanıcı Admin mi?
 * Yalnızca Admin rolündeki kullanıcıların erişmesine izin verir.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.session.eRoles;

    console.log('🔍 isAdmin middleware çalıştı');
    console.log('Session rolü:', userRole);
    console.log('Beklenen rol:', eRoles.Admin);

    if (userRole === eRoles.Admin) {
        console.log('✅ Admin doğrulandı');
        return next();
    }

    console.log('⛔ Yetki reddedildi');
    return res.status(403).render('error', {
        statusCode: 403,
        message: 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
        layout: false
    });
};

/**
 * 3. isAuthor — Kullanıcı postun sahibi mi?
 * Post düzenleme/silme işlemlerinde kullanılır.
 */
export const isAuthor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const newsId = req.params.id;
        const userId = req.session.userId;

        if (!newsId || !userId || !mongoose.Types.ObjectId.isValid(newsId)) {
            return res.status(400).render('error', {
                statusCode: 400,
                message: 'Geçersiz istek.',
                layout: false
            });
        }

        const news = await NewsDB.findById(newsId);
        if (!news) {
            return res.status(404).render('error', {
                statusCode: 404,
                message: 'Yazı bulunamadı.',
                layout: false
            });
        }

        if (news.author.toString() !== userId) {
            return res.status(403).render('error', {
                statusCode: 403,
                message: 'Bu işlem için yetkiniz bulunmamaktadır.',
                layout: false
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * 4. canDeleteComment — Kullanıcı yorumu silebilir mi?
 * Admin veya haberin sahibi silme işlemi yapabilir.
 */
export const canDeleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newsId } = req.params;
        const { userId, eRoles: userRole } = req.session;

        if (!userId || !userRole || !mongoose.Types.ObjectId.isValid(newsId)) {
            return res.status(400).render('error', {
                statusCode: 400,
                message: 'Geçersiz istek veya kimlik doğrulama hatası.',
                layout: false
            });
        }

        // Kural 1: Admin ise direkt geç
        if (userRole === eRoles.Admin) {
            return next();
        }

        // Kural 2: Post sahibi mi kontrol et
        const news = await NewsDB.findById(newsId);
        if (news && news.author.toString() === userId) {
            return next();
        }

        // Yetkisiz erişim
        return res.status(403).render('error', {
            statusCode: 403,
            message: 'Bu yorumu silme yetkiniz bulunmamaktadır.',
            layout: false
        });

    } catch (error) {
        next(error);
    }
};
