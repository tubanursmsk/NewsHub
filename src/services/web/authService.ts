import UserDB, { IUser, UserRole } from '../../models/userModel';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

/**
 * Yeni bir kullanıcı kaydeder. Parolayı hash'ler.
 * @param userData Kullanıcı bilgileri (name, email, password)
 * @returns Oluşturulan kullanıcı nesnesi
 * @throws Hata: Email zaten kullanılıyorsa veya veritabanı hatası varsa
 */
export const registerUser = async (userData: Pick<IUser, 'name' | 'email' | 'password'>): Promise<IUser> => {
    // 1. Email veritabanında var mı diye kontrol et
    const existingUser = await UserDB.findOne({ email: userData.email });
    if (existingUser) {
        throw new Error('Bu email adresi zaten kullanılıyor.');
    }

    // 2. Parolayı hash'le (bcrypt ile)
    const saltRounds = 10; // Hash'leme gücü (standart değer)
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // 3. Yeni kullanıcıyı oluştur ve kaydet
    const newUser = new UserDB({
        name: userData.name,
        email: userData.email,
        password: hashedPassword // Hash'lenmiş parolayı kaydet
        // Rol otomatik olarak 'User' atanacak (modeldeki default sayesinde)
    });

    return await newUser.save();
};

/**
 * Kullanıcı girişi yapar. Gelen parolayı hash ile karşılaştırır.
 * @param email Kullanıcının email adresi
 * @param password Kullanıcının girdiği düz metin parola
 * @returns Eşleşen kullanıcı nesnesi
 * @throws Hata: Kullanıcı bulunamazsa veya parola eşleşmezse
 */
export const loginUser = async (email: string, password: string): Promise<IUser> => {
    // 1. Kullanıcıyı email'e göre bul
    const user = await UserDB.findOne({ email });
    if (!user) {
        throw new Error('Email veya parola hatalı.');
    }

    // 2. Gelen düz metin parolayla veritabanındaki hash'lenmiş parolayı karşılaştır
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Email veya parola hatalı.');
    }

    // Kullanıcı bulundu ve parola doğru

    return user;
};

/**
 * YENİ FONKSİYON
 * ID'ye göre tek bir kullanıcıyı getirir. Güvenlik için parola alanını dışarıda bırakır.
 * @param userId Getirilecek kullanıcının ID'si
 * @returns Kullanıcı nesnesi (parola hariç) veya bulunamazsa null
 */
export const getUserById = async (userId: string): Promise<Omit<IUser, 'password'> | null> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return null;
        }
        // findById ile kullanıcıyı bul ve select('-password') ile parola alanını hariç tut
        const user = await UserDB.findById(userId).select('-password');
        return user;
    } catch (error) {
        console.error("ID'ye göre kullanıcı getirilirken hata:", error);
        throw new Error("Kullanıcı bilgileri yüklenirken bir sorun oluştu.");
    }
};

/**
 * YENİ FONKSİYON
 * Kullanıcı bilgilerini (isim ve email) günceller.
 * @param userId Güncellenecek kullanıcının ID'si
 * @param data Yeni isim ve email bilgisi
 * @returns Güncellenmiş kullanıcı nesnesi (parola hariç)
 * @throws Hata: Email zaten kullanılıyorsa veya veritabanı hatası varsa
 */
export const updateUserProfile = async (
    userId: string,
    data: { name: string; email: string }
): Promise<Omit<IUser, 'password'> | null> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return null;
        }

        // Opsiyonel: Eğer email değiştiriliyorsa, yeni email'in başka bir kullanıcı tarafından
        // kullanılıp kullanılmadığını kontrol etmemiz gerekir.
        const existingUserWithEmail = await UserDB.findOne({ email: data.email, _id: { $ne: userId } });
        if (existingUserWithEmail) {
            throw new Error('Bu email adresi başka bir kullanıcı tarafından kullanılıyor.');
        }

        // Kullanıcıyı bul ve güncelle, güncellenmiş halini döndür (parola hariç)
        const updatedUser = await UserDB.findByIdAndUpdate(
            userId,
            { name: data.name, email: data.email },
            { new: true, runValidators: true } // runValidators: Modeldeki email formatı gibi kuralları uygular
        ).select('-password');

        return updatedUser;
    } catch (error: any) {
        console.error("Profil güncellenirken hata:", error);
        // Hata mesajını doğrudan fırlat ki controller yakalasın
        throw new Error(error.message || "Profil güncellenirken bir sorun oluştu.");
    }
};

//Opsiyonel: Parola güncelleme için ayrı bir fonksiyon yazmak daha güvenlidir.
//export const updateUserPassword = async (userId: string, oldPass: string, newPass: string): Promise<void> => { ... }