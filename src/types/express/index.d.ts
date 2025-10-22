// src/types/express/index.d.ts
import { UserRole } from '../../models/userModel'; // userModel'den UserRole enum'unu import et

// express-session modülünü genişlet
declare module 'express-session' {
  interface SessionData {
    userId?: string;     // userId'nin string ve opsiyonel olduğunu belirt
    userRole?: UserRole; // userRole'ün UserRole enum tipinde ve opsiyonel olduğunu belirt
  }
}

// (Opsiyonel ama önerilir) Express'in global Request arayüzünü de genişlet
// Bu, req.file gibi sonradan eklenen özellikler için de kullanışlıdır
declare global {
    namespace Express {
        export interface Request {
            file?: Multer.File; // Multer için req.file'ı tanımla
        }
    }
}