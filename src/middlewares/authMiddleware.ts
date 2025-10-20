import { Request, Response, NextFunction } from 'express';

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

// Diğer yetkilendirme middleware'leri (isAdmin, isAuthor vb.)
// daha sonra buraya eklenebilir.