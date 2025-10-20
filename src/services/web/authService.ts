import UserDB, { IUser, UserRole } from '../../models/userModel'; 
import bcrypt from 'bcrypt';

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