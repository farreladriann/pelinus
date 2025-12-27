# 🖥️ Pelinus - Backend API

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

## 📖 Deskripsi

**Pelinus** adalah Backend REST API untuk aplikasi **Pelinus Mengajar** - sebuah platform pembelajaran untuk mengelola materi dan aktivitas belajar siswa. Backend ini dibangun menggunakan **Express. js** dengan **TypeScript** dan **MongoDB** sebagai database. 

🔗 **Live Demo:** [https://pelinus.vercel.app](https://pelinus.vercel.app)

## 🔗 Related Repository

| Repository | Deskripsi |
|------------|-----------|
| [pelinus_siswa](https://github.com/farreladriann/pelinus_siswa) | Mobile App (Flutter) - Frontend untuk siswa |

## ✨ Fitur Utama

- 🔐 RESTful API endpoints
- 📚 Manajemen materi pembelajaran
- 📁 Upload dan manajemen file (menggunakan Multer)
- 🛡️ Security middleware (Helmet, CORS)
- 📊 Request logging (Morgan)
- ⚡ Deployment otomatis di Vercel

## 🛠️ Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **TypeScript** | Type-safe JavaScript |
| **Express. js v5** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **Typegoose** | TypeScript decorators untuk Mongoose |
| **Multer** | File upload handling |
| **Helmet** | Security headers |
| **CORS** | Cross-Origin Resource Sharing |
| **Morgan** | HTTP request logger |

## 📁 Struktur Proyek

```
pelinus/
├── src/
│   ├── config/        # Konfigurasi database & environment
│   ├── controllers/   # Logic handler untuk routes
│   ├── models/        # Schema database (Mongoose/Typegoose)
│   ├── routes/        # Definisi API endpoints
│   ├── public/        # Static files
│   └── index.ts       # Entry point aplikasi
├── package.json
├── tsconfig.json
└── vercel.json        # Konfigurasi deployment Vercel
```

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js v18+
- MongoDB (local atau Atlas)
- npm atau yarn

### Instalasi

```bash
# Clone repository
git clone https://github.com/farreladriann/pelinus.git
cd pelinus

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
# Isi konfigurasi MongoDB URI dan variabel lainnya

# Jalankan development server
npm run dev
```

### Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Menjalankan server dengan hot-reload (nodemon) |
| `npm start` | Menjalankan server production |
| `npm run build` | Build TypeScript ke JavaScript |
| `npm run lint` | Cek code style dengan ESLint |
| `npm run lint: fix` | Auto-fix code style issues |

## 📝 Environment Variables

```env
MONGODB_URI=mongodb+srv://...
PORT=3000
```

## 👨‍💻 Author

**Farrel Adrian**
- GitHub: [@farreladriann](https://github.com/farreladriann)

---

⭐ Jika project ini membantu, jangan lupa berikan star! 
