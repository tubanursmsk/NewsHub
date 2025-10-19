import express from 'express';
import session from 'express-session';
import path from 'path';
import bodyParser from 'body-parser';
import { connectDB } from './utils/db';
import { IUser, UserRole } from './models/userModel'; // UserRole'ü import et
// import { globalFilter } from './utils/globalFilter' // Şimdilik devre dışı bırakalım
import dotenv from 'dotenv';
//import authWebRoutes from './routes/web/authRoutes';
// import dashboardRoutes from './routes/web/dashboardRoutes'; // Gelecek adımlar için
//import postWebRoutes from './routes/web/postRoutes'; 
import ejsLayouts from 'express-ejs-layouts'; 



// .env Config
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Session'ı daha iyi type-safe yapmak için düzenleme
declare module 'express-session' {
    interface SessionData {
        userId: string;
        userRole: UserRole;
    }
}


app.use(session({
    secret: process.env.SESSION_SECRET || 'gizli_bir_anahtar', // .env'den okumak en iyisi
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production' // Sadece HTTPS'te cookie gönder
    }
}));

// Bu middleware, session'daki kullanıcı bilgilerini
// tüm EJS şablonlarında 'user' adıyla erişilebilir hale getirir.
app.use((req, res, next) => {
    // Kullanıcı giriş yapmışsa, bilgilerini 'locals'a ata
    if (req.session.userId && req.session.userRole) {
        res.locals.user = {
            id: req.session.userId,
            role: req.session.userRole
        };
    } else {
        // Kullanıcı giriş yapmamışsa, 'user' değişkenini null yap
        // Bu, EJS tarafında 'if (user)' kontrolünün hatasız çalışmasını sağlar.
        res.locals.user = null; 
    }
    next();
});

// DB Config
connectDB();

// EJS Configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(ejsLayouts);


// body-parser Config
app.use(express.urlencoded({ extended: true })); // body-parser artık express içinde
app.use(express.json());

// --- Rotaları Kullanma ---



// Global Hata Yöneticisi (sonraki adımlarda eklenecek)
// app.use(globalFilter)

app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});