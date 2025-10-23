import { Request, Response, NextFunction } from 'express';
import * as authService from '../../services/web/authService'; 
import * as postService from '../../services/web/newsService'; 

/**
 * Admin dashboard sayfasını gösterir.
 * Tüm kullanıcıları ve tüm postları listeler.
 */
export const showAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Tüm kullanıcıları ve postları servislerden çek (Promise.all ile paralel)
        const [users, posts] = await Promise.all([
            authService.getAllUsers(),
            postService.getAllPosts() 
        ]);

        // 'admin/dashboard.ejs' view'ını render et ve verileri gönder
        res.render('admin/dashboard', { 
            users: users,
            posts: posts,
            activePage: 'admin' // Sidebar için
        });

    } catch (error) {
        // Hata olursa genel hata yöneticisine gönder
        next(error);
    }
};

/**
 * YENİ FONKSİYON
 * Bir kullanıcıyı silme isteğini işler (Admin yetkisiyle).
 */
export const handleDeleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userIdToDelete = req.params.id; // URL'den silinecek kullanıcının ID'si
        const currentUserId = req.session.userId; // İşlemi yapan adminin ID'si

        // Adminin kendini silmesini engellemek iyi bir pratiktir
        if (userIdToDelete === currentUserId) {
            // TODO: Kendini silemezsin mesajını flash mesaj olarak göstermek daha iyi olur
            console.warn(`Admin (${currentUserId}) kendini silmeye çalıştı.`);
            return res.redirect('/admin/dashboard?error=cannotDeleteSelf'); // Hata query param ile geri dön
        }

        // Servisi çağırarak kullanıcıyı sil
        await authService.deleteUser(userIdToDelete);

        // Başarılı silme sonrası admin dashboard'a geri yönlendir (başarı mesajıyla)
        res.redirect('/admin/dashboard?userDeleted=true');

    } catch (error) {
        // Hata olursa genel hata yöneticisine gönder
        // TODO: Hata mesajını flash mesaj olarak göstermek daha iyi olur
        console.error("Admin - Kullanıcı silme hatası:", error);
        res.redirect(`/admin/dashboard?error=${encodeURIComponent((error as Error).message)}`); // Hata mesajıyla geri dön
        // Veya: next(error); // Genel 500 sayfasına gönderir
    }
};

/**
 * YENİ FONKSİYON
 * Bir postu silme isteğini işler (Admin yetkisiyle).
 */
export const handleDeletePostAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postIdToDelete = req.params.id; // URL'den silinecek post'un ID'si

        // Servisi çağırarak postu (ve ilişkili yorumları) sil
        await postService.deletePost(postIdToDelete);

        // Başarılı silme sonrası admin dashboard'a geri yönlendir (başarı mesajıyla)
        res.redirect('/admin/dashboard?postDeleted=true');

    } catch (error) {
        // Hata olursa genel hata yöneticisine gönder
        console.error("Admin - Post silme hatası:", error);
        res.redirect(`/admin/dashboard?error=${encodeURIComponent((error as Error).message)}`); // Hata mesajıyla geri dön
        // Veya: next(error); 
    }
};

// ... (Post silme fonksiyonu buraya eklenecek) ...

// Diğer admin kontrolör fonksiyonları (kullanıcı sil, post sil vb.)
// daha sonra buraya eklenebilir.