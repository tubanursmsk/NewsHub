import { Request, Response, NextFunction } from 'express';
// Servis ve Model importları (yollarının doğru olduğundan emin ol)
import * as newsService from '../../services/web/newsService';
import * as commentService from '../../services/web/commentService';
import { NewsCategory } from '../../models/newsModel'; // Enum importu
import { validationResult } from 'express-validator';

/**
 * Anasayfayı render eder. Veritabanından tüm postları çeker ve view'a gönderir.
 */
export const showHomePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await newsService.getAllPosts();
        res.render('home', {
            posts: posts,
            activePage: 'home' // Sidebar için aktif sayfa
        });
    } catch (error) {
        next(error); // Hata yöneticisine gönder
    }
};


/**
 * Yeni post oluşturma formunu gösterir.
 * Kategorileri ve boş varsayılanları view'a gönderir.
 */
export const showNewPostForm = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.render('news/new', {
            error: null,
            categories: Object.values(NewsCategory),
            oldInput: { title: '', content: '', category: '' },
            activePage: 'newPost' // Sidebar için aktif sayfa (opsiyonel)
        });
    } catch (e) {
        // Render hatası olursa genel hata yöneticisine gönder
        next(e);
    }
};
/**
 * Yeni post oluşturma formundan gelen veriyi işler (Validasyonlu).
 */
export const handleCreatePost = async (req: Request, res: Response, next: NextFunction) => {
    // 1. Validasyon sonuçlarını kontrol et
    const errors = validationResult(req);
    const { title, content, category } = req.body;
    const authorId = req.session.userId;

    // 2. Eğer validasyon hatası varsa...
    if (!errors.isEmpty()) {
        // Formu, validasyon hataları ve eski verilerle tekrar render et
        return res.status(400).render('news/new', {
            errors: errors.array(), // Hataları gönder
            oldInput: { title, content, category }, // Eski veriyi gönder
            categories: Object.values(NewsCategory),
            error: null, // Genel hata yok
            activePage: 'newPost'
        });
    }
    
    // 3. Validasyon hatası yoksa devam et...
    if (!authorId) { /* ... (giriş kontrolü aynı) ... */ }

    try {
        let imageUrl: string | undefined = undefined;
        const file = (req as any).file as Express.Multer.File | undefined;
        if (file) { imageUrl = file.filename; }

        await newsService.createPost(title.trim(), content.trim(), authorId, category, imageUrl);
        res.redirect('/dashboard');

    } catch (error) {
        // Multer veya Servis hatası
        if (error instanceof Error && error.message.startsWith('Hata: Sadece resim dosyaları')) {
             return res.status(400).render('posts/new', { /* ... (multer hatası render) ... */ });
         }
         next(error); // Diğer hataları genel yöneticiye gönder
    }
};


/**
 * Kullanıcının dashboard sayfasını gösterir. Kullanıcının kendi postlarını listeler.
 */
export const showDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect('/login'); // Session yoksa login'e yönlendir
        }

        const userPosts = await newsService.getPostsByAuthor(userId);

        res.render('dashboard', {
            posts: userPosts,
            activePage: 'dashboard' // Sidebar için aktif sayfa
        });

    } catch (error) {
        next(error); // Hata yöneticisine gönder
    }
};


/**
 * Post detay sayfasını gösterir. Post ve yorum bilgilerini yükler.
 */
export const showPostDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id;

        const [post, comments] = await Promise.all([
            newsService.getPostById(postId),
            commentService.getCommentsByPostId(postId)
        ]);

        if (!post) {
            const error: any = new Error("Yazı bulunamadı.");
            error.status = 404;
            return next(error); // 404 middleware'ini tetikle
        }

        res.render('posts/detail', {
            post: post,
            comments: comments,
            activePage: 'post' // Sidebar için aktif sayfa (opsiyonel)
        });

    } catch (error) {
        next(error);
    }
};
/**
 * YENİ FONKSİYON
 * Post düzenleme sayfasını, mevcut post bilgileri ve kategorilerle render eder.
 */
export const showEditPostForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id;
        const post = await newsService.getPostById(postId);

        if (!post) {
            const error: any = new Error("Düzenlenecek yazı bulunamadı.");
            error.status = 404;
            return next(error);
        }

        res.render('posts/edit', {
            post: post, // Formu doldurmak için post bilgisi
            categories: Object.values(NewsCategory), // Kategori dropdown'ı için
            error: null, // Hata mesajı için başlangıç değeri
            activePage: 'editPost' // Sidebar için (opsiyonel)
        });
    } catch (error) {
        next(error);
    }
};
/**
 * Düzenlenen post formundan gelen veriyi işler (Validasyonlu).
 */
export const handleUpdatePost = async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.id;
    const userId = req.session.userId; // Yetki kontrolü için (isAuthor zaten yapıyor ama...)

    // 1. Validasyon sonuçlarını kontrol et
    const errors = validationResult(req);
    const { title, content, category } = req.body;

    // 2. Eğer validasyon hatası varsa...
    if (!errors.isEmpty()) {
        // Hata durumunda formu tekrar doldurmak için postu ve eski girilenleri gönder
        const post = await newsService.getPostById(postId); // Mevcut postu çek
        return res.status(400).render('posts/edit', {
            errors: errors.array(), // Hataları gönder
            post: post, // Post bilgisini yine de gönder (ID vb. için)
            oldInput: { title, content, category }, // Hatalı girilen veriyi gönder
            categories: Object.values(NewsCategory),
            error: null,
            activePage: 'editPost'
        });
    }

    // 3. Validasyon hatası yoksa devam et...
    if (!userId) { /* ... (giriş kontrolü) ... */ }

    try {
        let imageUrl: string | undefined = undefined;
        const file = (req as any).file as Express.Multer.File | undefined;
        if (file) { imageUrl = file.filename; }

        const updateData = {
            title: title.trim(),
            content: content.trim(),
            category,
            imageUrl: imageUrl
        };

        if (imageUrl === undefined) {
             const existingPost = await newsService.getPostById(postId);
             updateData.imageUrl = existingPost?.imageUrl;
        }

        const updatedPost = await newsService.updatePost(postId, updateData);
        if (!updatedPost) { /* ... (post bulunamadı hatası) ... */ }

        res.redirect(`/posts/${postId}`);

    } catch (error) {
        // Multer veya Servis hatası
         if (error instanceof Error && error.message.startsWith('Hata: Sadece resim dosyaları')) {
             const post = await newsService.getPostById(postId);
             return res.status(400).render('posts/edit', { /* ... (multer hatası render) ... */ });
         }
         next(error); // Diğer hataları genel yöneticiye gönder
    }
};

/**
 * YENİ FONKSİYON
 * Bir post'u siler ve kullanıcıyı dashboard'a yönlendirir.
 */
export const handleDeletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id;
        await newsService.deletePost(postId);
        // Başarılı silme sonrası dashboard'a yönlendir
        res.redirect('/dashboard');
    } catch (error) {
        next(error); // Hata yöneticisine gönder
    }
};

