import express, { Request, Response, NextFunction } from 'express'; // Request, Response, NextFunction import edildi
import session from 'express-session';
import path from 'path';
import { connectDB } from './utils/db';
import { UserRole } from './models/userModel';
import dotenv from 'dotenv';
import ejsLayouts from 'express-ejs-layouts';

// --- Rota Dosyalarını Import Et ---
import authRoutes from './routes/web/authRoutes';
import postRoutes from './routes/web/postRoutes'; // Henüz oluşturulmadıysa yorumda kalsın
import adminRoutes from './routes/web/adminRoutes';

// .env Config
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Session Tipi Tanımı
declare module 'express-session' {
    interface SessionData {
        userId?: string;
        userRole?: UserRole;
    }
}

// Session Middleware
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

// Global Kullanıcı Bilgisi Middleware'i
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId && req.session.userRole) {
        res.locals.user = {
            id: req.session.userId,
            role: req.session.userRole
        };
    } else {
        res.locals.user = null;
    }
    next();
});

// Veritabanı Bağlantısı
connectDB();

// EJS Ayarları
app.use(ejsLayouts);
app.set('layout', './layouts/main'); // Ana layout dosyanızın adı (views klasörü içinde)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rota Kullanımı ---
app.use('/', authRoutes);
app.use('/', postRoutes); 
app.use('/admin', adminRoutes);


// Statik Dosyalar (Public klasörünü dışarıya açar)
app.use(express.static(path.join(__dirname, '../public'))); // ../ ile kök dizine çıkıp public'i bul

// ======== HATA YÖNETİMİ GÜNCELLENDİ ========

// 404 Hata Yönetimi (Diğer rotalardan sonra gelmeli)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).render('error', { // Tek 'error.ejs' dosyasını kullan
        statusCode: 404,
        message: "Aradığınız sayfa bulunamadı.",
        layout: false // 'error.ejs' kendi HTML yapısını içerecek
    });
});

// Global error handler ile tüm hatalar tek noktadan yönetiliyor
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Geliştirme sırasında hatayı konsolda görmek önemlidir
    res.status(500).render('error', { // Tek 'error.ejs' dosyasını kullan
        statusCode: 500,
        // Production ortamında kullanıcıya detaylı hata mesajı göstermemek daha güvenlidir.
        message: process.env.NODE_ENV === 'production' ? "Sunucuda beklenmedik bir hata oluştu." : err.message,
        layout: false // 'error.ejs' kendi HTML yapısını içerecek
    });
});




app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});