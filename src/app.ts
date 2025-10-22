import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import { connectDB } from './utils/db'; // MVC projesindeki db bağlantısı
import { UserRole } from './models/userModel';
import dotenv from 'dotenv';
import ejsLayouts from 'express-ejs-layouts';
import swaggerUi from 'swagger-ui-express';   // Swagger UI
import swaggerJSDoc from 'swagger-jsdoc';     // Swagger JSDoc
import { swaggerOptions } from './utils/swaggerOptions'; // API projesinden taşınan swagger ayarları

// --- Rota Dosyalarını Import Et ---
// Web (MVC) Rotaları
import authWebRoutes from './routes/web/authRoutes';
import postWebRoutes from './routes/web/postRoutes';
import adminWebRoutes from './routes/web/adminRoutes';

// API Rotaları (Oluşturulmuş olmalı)
import userApiRoutes from '../routes/api/user.routes';      
import categoryApiRoutes from './routes/api/category.routes';
import newsApiRoutes from './routes/api/news.routes';        
import commentApiRoutes from './routes/api/comment.routes';  


// .env Config (En başta sadece bir kez)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware'ler ===

// Body Parsers (JSON ve URL Encoded)
app.use(express.json()); // API için
app.use(express.urlencoded({ extended: true })); // Web formları için

// Session Middleware (Daha çok Web için kullanılır)
// Not: API tarafı JWT kullandığı için session'a bağımlı olmamalıdır.
app.use(session({
    secret: process.env.SESSION_SECRET || 'varsayilan_cok_gizli_anahtar',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 gün
    }
}));

// Global Kullanıcı Bilgisi Middleware'i (Sadece EJS için)
app.use((req: Request, res: Response, next: NextFunction) => {
    // Bu middleware API isteklerini etkilememeli
    if (req.originalUrl.startsWith('/api/v1')) {
        return next(); // API isteğiyse atla
    }
    // Web isteği ise session'dan user bilgisini locals'a ekle
    if (req.session.userId && req.session.userRole) {
        res.locals.user = { id: req.session.userId, role: req.session.userRole };
    } else {
        res.locals.user = null;
    }
    next();
});

// Statik Dosyalar (public/uploads içindeki resimler için)
app.use(express.static(path.join(__dirname, '../public')));

// Veritabanı Bağlantısı
connectDB();

// EJS Ayarları
app.use(ejsLayouts);
app.set('layout', './layouts/main');
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// === Swagger Kurulumu ===
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// === Rota Yönlendirme ===

// API Rotaları ( '/api/v1' ön eki ile)
app.use('/api/v1', userApiRoutes);     // Örn: /api/v1/auth/register
app.use('/api/v1', categoryApiRoutes); // Örn: /api/v1/categories
app.use('/api/v1', newsApiRoutes);     // Örn: /api/v1/news
app.use('/api/v1', commentApiRoutes);  // Örn: /api/v1/comments

// Web (MVC) Rotaları (Prefixsiz)
app.use('/', authWebRoutes);    // /login, /register, /profile vb.
app.use('/', postWebRoutes);    // /, /posts/new, /dashboard, /posts/:id vb.
app.use('/admin', adminWebRoutes); // /admin/dashboard vb.


// === Hata Yönetimi (En sonda olmalı) ===

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).render('error', {
        statusCode: 404,
        message: "Aradığınız sayfa bulunamadı.",
        layout: false
    });
});

// Genel Hata Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => { // 'err' tipini 'any' yaptık
    console.error("Beklenmedik Hata:", err); // Hatayı logla

    // API istekleri için JSON yanıtı dönelim
    if (req.originalUrl.startsWith('/api/v1')) {
        return res.status(err.status || 500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'production' ? 'Sunucuda bir hata oluştu.' : err.message || 'Bilinmeyen sunucu hatası.'
        });
    }

    // Web istekleri için EJS sayfasını render edelim
    res.status(err.status || 500).render('error', {
        statusCode: err.status || 500,
        message: process.env.NODE_ENV === 'production' ? "Sunucuda beklenmedik bir hata oluştu." : err.message || 'Bilinmeyen sunucu hatası.',
        layout: false
    });
});


// === Sunucuyu Başlat ===
app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});