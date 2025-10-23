import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import { connectDB } from './utils/db';
import { eRoles } from './utils/eRoles';
import dotenv from 'dotenv';
import ejsLayouts from 'express-ejs-layouts';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOptions } from './utils/swaggerOptions';

// --- Rota Importları ---

import authWebRoutes from './routes/web/authRoutes';
import newsWebRoutes from './routes/web/newsRoutes';
import adminWebRoutes from './routes/web/adminRoutes';
import userApiRoutes from './routes/api/user.routes';
import categoryApiRoutes from './routes/api/category.routes';
import newsApiRoutes from './routes/api/news.routes';
import commentApiRoutes from './routes/api/comment.routes';


// ============ YENİDEN EKLENECEK BLOK ============
// Session tiplerini doğrudan bu dosyada tanımla
declare module 'express-session' {
    interface SessionData {
        userId?: string;
        eRoles?: eRoles;
    }
}
// ===============================================


// .env Config
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware'ler ===

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
    // ... (session ayarlarınız) ...
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
// Artık req.session.userId ve req.session.userRole tanınmalı
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api/v1')) {
        return next(); 
    }
    if (req.session.userId && req.session.eRoles) {
        res.locals.user = { id: req.session.userId, role: req.session.eRoles };
    } else {
        res.locals.user = null;
    }
    next();
});

// ... (geri kalan kodlar: static, connectDB, EJS, Swagger, Rotalar, Hata Yönetimi, app.listen) ...
// Statik Dosyalar 
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
app.use('/api/v1', userApiRoutes);
app.use('/api/v1', categoryApiRoutes);
app.use('/api/v1', newsApiRoutes);
app.use('/api/v1', commentApiRoutes);
app.use('/', authWebRoutes);
app.use('/', newsWebRoutes);
app.use('/admin', adminWebRoutes);


// === Hata Yönetimi ===
// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith('/api/v1')) {
         return res.status(404).json({ status: 'error', message: 'Endpoint not found.' });
    }
    res.status(404).render('error', {
        statusCode: 404,
        message: "Aradığınız sayfa bulunamadı.",
        layout: false
    });
});

// Genel Hata Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => { 
    console.error("Beklenmedik Hata:", err); 

    if (req.originalUrl.startsWith('/api/v1')) {
        return res.status(err.status || 500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'production' ? 'Sunucuda bir hata oluştu.' : err.message || 'Bilinmeyen sunucu hatası.'
        });
    }

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