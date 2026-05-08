/backend/
├── src/
│   ├── config/             # Konfigurasi DB (Sequelize), Midtrans, & Dotenv
│   ├── constants/          # Status order, tipe pembayaran, satuan (Enum)
│   ├── controllers/        # Handle Request & Response
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│   ├── middleware/         # Auth guard, Logger, Error handler
│   ├── models/             # Definisi Tabel (Sequelize Models)
│   │   ├── index.js        # Relasi antar tabel didefinisikan di sini
│   │   ├── Product.js
│   │   ├── ProductUnit.js
│   │   ├── Order.js
│   │   └── Payment.js
│   ├── routes/             # Definisi Endpoint API
│   │   ├── index.js        # Main router
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── services/           # LOGIKA BISNIS (Midtrans API, Kalkulasi Stok)
│   │   ├── midtransService.js
│   │   └── stockService.js
│   ├── utils/              # Helper functions (Format currency, Generate Invoice)
│   └── app.js              # Express setup
└── server.js

/frontend/
├── public/                 # Logo toko & aset statis
├── src/
│   ├── api/                # Konfigurasi Axios & API Calls
│   ├── assets/             # CSS global, images
│   ├── components/         # Reusable UI (Buttons, Inputs, Modals)
│   │   ├── shared/         # Navbar, Sidebar, Footer
│   │   └── ui/             # Shadcn/UI atau Tailwind components
│   ├── features/           # FITUR UTAMA (Logic & UI spesifik)
│   │   ├── auth/           # Login & Register logic
│   │   ├── inventory/      # Kelola produk & stok
│   │   ├── pos/            # Kasir/Input Order (Dashboard Admin)
│   │   └── transactions/   # Riwayat order & Status Midtrans
│   ├── hooks/              # Custom React Hooks (misal: useCart, useAuth)
│   ├── layouts/            # Layout Admin vs Layout Public
│   ├── pages/              # Komponen Halaman (Entry point router)
│   ├── store/              # State Management (Zustand atau Redux)
│   ├── utils/              # Helper (Format tgl, Konversi angka ke Rupiah)
│   ├── App.jsx             # Routing & Providers
│   └── main.jsx            # Entry point
└── index.html