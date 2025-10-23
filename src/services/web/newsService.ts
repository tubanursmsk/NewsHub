import mongoose from 'mongoose';
import { INews } from '../../models/newsModel';
import NewsDB, { PostCategory } from '../../models/newsModel';
import CommentDB from '../../models/commentModel'; // YENİ: İlişkili yorumları silmek için gerekli
/**
 * Veritabanına yeni bir post oluşturur.
 * @param title Post başlığı
 * @param content Post içeriği
 * @param authorId Postu oluşturan kullanıcının ID'si (string olarak gelir)
 * @param category Post kategorisi
 * @param imageUrl Yüklenen resmin dosya adı (opsiyonel)
 * @returns Oluşturulan post nesnesi
 */
export const createPost = async (
    title: string, 
    content: string, 
    authorId: string, // Bu string olarak kalacak
    category: PostCategory, 
    imageUrl?: string
): Promise<INews> => { 
    try {
        // newPostData objesinin tipini belirtmeye gerek yok, Mongoose halleder.
        const newPostData = { 
            title,
            content,
            author: authorId, // String ID'yi doğrudan atayın
            category,
            imageUrl: imageUrl || undefined // Eğer imageUrl yoksa undefined olsun
        };
       
        const newPost = new NewsDB(newPostData);
        return await newPost.save();
    } catch (error) {
        console.error("Post oluşturulurken veritabanı hatası:", error);
        if (error instanceof mongoose.Error.ValidationError) {
             throw new Error("Lütfen tüm zorunlu alanları doğru şekilde doldurun.");
        }
        throw new Error("Yazı kaydedilirken bir sorun oluştu.");
    }
};

/**
 * Veritabanındaki tüm postları, yazar bilgileriyle birlikte getirir.
 * En yeniden en eskiye doğru sıralar.
 * @returns Tüm postların dizisi
 */
export const getAllPosts = async (): Promise<INews[]> => {
    try {
        const newss = await NewsDB.find()
            .populate('author', 'name') 
            .sort({ createdAt: -1 }); 
        return newss;
    } catch (error) {
        console.error("Tüm postlar getirilirken hata:", error);
        throw new Error("Yazılar yüklenirken bir sorun oluştu."); 
    }
};

/**
 * Belirli bir kullanıcı ID'sine ait tüm postları getirir.
 * En yeniden en eskiye doğru sıralar.
 * @param authorId Kullanıcı ID'si (session'dan alınacak)
 * @returns Kullanıcıya ait postların dizisi
 */
export const getPostsByAuthor = async (authorId: string): Promise<INews[]> => {
    try {
        // 'author' alanı verilen authorId ile eşleşen postları bul ve sırala
        const news = await NewsDB.find({ author: authorId })
            .sort({ createdAt: -1 }); // Populate'a burada gerek yok, zaten kendi yazıları
        return news;
    } catch (error) {
        console.error("Yazara ait postlar getirilirken hata:", error);
        throw new Error("Yazılarınız yüklenirken bir sorun oluştu.");
    }
};


/**
 * ID'ye göre tek bir postu getirir. Yazar bilgilerini de populate eder.
 * @param newsId Getirilecek post'un ID'si
 * @returns Post nesnesi veya bulunamazsa null
 * @throws Hata: Veritabanı hatası varsa
 */
export const getPostById = async (newsId: string): Promise<INews | null> => {
    try {
        // ID'nin geçerli bir ObjectId formatında olup olmadığını kontrol etmek iyi bir pratiktir
        if (!mongoose.Types.ObjectId.isValid(newsId)) {
            return null; // Geçersiz ID ise null döndür
        }
        
        // Post'u ID'ye göre bul ve 'author' alanını User modelinden 'name' ile doldur
        const post = await NewsDB.findById(newsId).populate('author', 'name');
        return post;
    } catch (error) {
        console.error("ID'ye göre post getirilirken hata:", error);
        throw new Error("Yazı yüklenirken bir sorun oluştu.");
    }
};


/**
 * YENİ FONKSİYON
 * Veritabanındaki bir post'u günceller.
 * @param newsId Güncellenecek post'un ID'si
 * @param data Yeni başlık, içerik, kategori ve resim yolu bilgisi
 * @returns Güncellenmiş post nesnesi veya bulunamazsa null
 */
export const updatePost = async (
    newsId: string,
    data: { title: string; content: string; category: PostCategory; imageUrl?: string }
): Promise<INews | null> => {
    try {
        // Opsiyonel: Güncellemeden önce ID'nin geçerliliğini kontrol et
        if (!mongoose.Types.ObjectId.isValid(newsId)) {
            return null;
        }
        // findByIdAndUpdate: ID'ye göre bulur ve verilen data ile günceller.
        // { new: true } seçeneği, güncellenmiş (yeni) dökümanı döndürmesini sağlar.
        return await NewsDB.findByIdAndUpdate(newsId, data, { new: true, runValidators: true }); // runValidators: Modeldeki kuralları uygular
    } catch (error) {
        console.error("Post güncellenirken hata:", error);
        if (error instanceof mongoose.Error.ValidationError) {
             throw new Error("Lütfen tüm zorunlu alanları doğru şekilde doldurun.");
        }
        throw new Error("Yazı güncellenirken bir sorun oluştu.");
    }
};

/**
 * YENİ FONKSİYON
 * Veritabanından bir post'u siler.
 * TODO: İlişkili yorumları da silmek veya post silinemez kuralı eklemek düşünülebilir.
 * @param newsId Silinecek post'un ID'si
 */
export const deletePost = async (newsId: string): Promise<void> => {
  try {
        if (!mongoose.Types.ObjectId.isValid(newsId)) {
            throw new Error("Geçersiz yazı ID'si.");
        }
        // İlişkili yorumları da silmek için önce yorumları bul ve sil
        await CommentDB.deleteMany({ news: newsId }); // <-- YORUMLARI SİLME EKLENDİ

        // Sonra postu sil
        const result = await NewsDB.findByIdAndDelete(newsId);
        if (!result) {
            throw new Error("Silinecek yazı bulunamadı.");
        }
        console.log(`Post (${newsId}) ve ilişkili yorumlar silindi.`); // Loglama güncellendi

    } catch (error) {
        console.error("Post silinirken hata:", error);
        throw new Error("Yazı silinirken bir sorun oluştu.");
    }
};


