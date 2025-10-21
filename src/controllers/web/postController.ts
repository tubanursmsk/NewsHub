import { Request, Response, NextFunction } from 'express';
// Servis ve Model importları (yollarının doğru olduğundan emin ol)
import * as postService from '../../services/web/postService';
import * as commentService from '../../services/web/commentService';
import { PostCategory } from '../../models/postModel'; // Enum importu

/**
 * Anasayfayı render eder. Veritabanından tüm postları çeker ve view'a gönderir.
 */
export const showHomePage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await postService.getAllPosts();
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
        res.render('posts/new', {
            error: null,
            categories: Object.values(PostCategory),
            oldInput: { title: '', content: '', category: '' },
            activePage: 'newPost' // Sidebar için aktif sayfa (opsiyonel)
        });
    } catch (e) {
        // Render hatası olursa genel hata yöneticisine gönder
        next(e);
    }
};

/**
 * Yeni post oluşturma formundan gelen veriyi, resmi ve kategoriyi işler.
 */
export const handleCreatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // req.body tanımsızsa erken hata ver
        if (!req.body) {
            console.error("Hata: req.body tanımsız geldi! Multer düzgün çalışmıyor olabilir.");
            throw new Error("Form verileri alınamadı.");
        }

        const { title, content, category } = req.body;
        const authorId = req.session.userId;

        if (!authorId) {
             // Giriş yapılmamışsa 401 hatası ver
            return res.status(401).render('error', {
                statusCode: 401,
                message: "Yazı eklemek için giriş yapmalısınız.",
                layout: false
            });
        }

        // Basit validasyon
        if (!title || !content || !category || title.trim() === '' || content.trim() === '' || category.trim() === '') {
             return res.status(400).render('posts/new', {
                 error: "Başlık, kategori ve içerik alanları boş bırakılamaz.",
                 categories: Object.values(PostCategory),
                 oldInput: { title, content, category },
                 activePage: 'newPost'
             });
        }

        // Yüklenen dosyanın adını al (Tip İddiası ile)
        let imageUrl: string | undefined = undefined;
        const file = (req as any).file as Express.Multer.File | undefined;
        if (file) {
            imageUrl = file.filename;
        }

        // Servise category'yi de gönder
        await postService.createPost(title, content, authorId, category, imageUrl);

        // Başarılı ekleme sonrası dashboard'a yönlendir
        res.redirect('/dashboard');

    } catch (error) {
         // Multer'dan gelen dosya türü hatasını yakala ve formu tekrar göster
         if (error instanceof Error && error.message.startsWith('Hata: Sadece resim dosyaları')) {
             return res.status(400).render('posts/new', {
                 error: error.message,
                 categories: Object.values(PostCategory),
                 oldInput: req.body,
                 activePage: 'newPost'
            });
         }
         // Diğer tüm hataları genel hata yöneticisine gönder
         next(error);
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

        const userPosts = await postService.getPostsByAuthor(userId);

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
            postService.getPostById(postId),
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
        const post = await postService.getPostById(postId);

        if (!post) {
            const error: any = new Error("Düzenlenecek yazı bulunamadı.");
            error.status = 404;
            return next(error);
        }

        res.render('posts/edit', {
            post: post, // Formu doldurmak için post bilgisi
            categories: Object.values(PostCategory), // Kategori dropdown'ı için
            error: null, // Hata mesajı için başlangıç değeri
            activePage: 'editPost' // Sidebar için (opsiyonel)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * YENİ FONKSİYON
 * Düzenlenen post formundan gelen veriyi ve (varsa) yeni resmi işler.
 */
export const handleUpdatePost = async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.id; // URL'den ID'yi al
    try {
        if (!req.body) { throw new Error("Form verileri alınamadı."); }

        const { title, content, category } = req.body;
        
        // Basit validasyon
        if (!title || !content || !category || title.trim() === '' || content.trim() === '' || category.trim() === '') {
            const post = await postService.getPostById(postId); // Hata durumunda formu tekrar doldurmak için postu çek
             return res.status(400).render('posts/edit', {
                 error: "Başlık, kategori ve içerik alanları boş bırakılamaz.",
                 categories: Object.values(PostCategory),
                 post: post, // Post bilgisini tekrar gönder
                 oldInput: { title, content, category } // Girilen eski değerleri de gönderelim (opsiyonel)
             });
        }

        // Yeni resim yüklendi mi kontrol et
        let imageUrl: string | undefined = undefined;
        const file = (req as any).file as Express.Multer.File | undefined;
        if (file) {
            imageUrl = file.filename;
            // TODO: Eğer yeni resim yüklendiyse, eski resmi sunucudan silmek iyi bir pratiktir.
        }

        // Güncellenecek veriyi hazırla
        const updateData = {
            title: title.trim(),
            content: content.trim(),
            category,
            imageUrl: imageUrl // Yeni resim varsa filename, yoksa undefined olacak
        };

        // Eğer yeni resim yüklenmediyse, imageUrl alanını güncelleme (eski resim kalsın)
        if (imageUrl === undefined) {
             // Mevcut postun imageUrl'ini alıp tekrar ekleyebiliriz veya servisi güncelleyebiliriz.
             // Şimdilik: Eğer yeni resim yoksa imageUrl'i veriden çıkaralım.
             // Daha iyi yöntem: Servis fonksiyonunu sadece gönderilen alanları güncelleyecek şekilde yapmak.
             // Ama basitlik adına şimdilik böyle bırakalım. Eğer resim silinmek istenirse ayrı bir mekanizma gerekir.
            const existingPost = await postService.getPostById(postId);
            updateData.imageUrl = existingPost?.imageUrl; // Eski resmi koru
        }


        const updatedPost = await postService.updatePost(postId, updateData);

        if (!updatedPost) {
             const error: any = new Error("Yazı güncellenemedi veya bulunamadı.");
             error.status = 404;
             return next(error);
        }

        // Başarılı güncelleme sonrası detay sayfasına yönlendir
        res.redirect(`/posts/${postId}`);

    } catch (error) {
         // Multer hatası veya servis hatası olabilir
         if (error instanceof Error && error.message.startsWith('Hata: Sadece resim dosyaları')) {
             const post = await postService.getPostById(postId);
             return res.status(400).render('posts/edit', {
                 error: error.message,
                 categories: Object.values(PostCategory),
                 post: post,
                 oldInput: req.body
            });
         }
         // Diğer hataları genel yöneticiye gönder
         next(error);
    }
};

/**
 * YENİ FONKSİYON
 * Bir post'u siler ve kullanıcıyı dashboard'a yönlendirir.
 */
export const handleDeletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = req.params.id;
        await postService.deletePost(postId);
        // Başarılı silme sonrası dashboard'a yönlendir
        res.redirect('/dashboard');
    } catch (error) {
        next(error); // Hata yöneticisine gönder
    }
};

