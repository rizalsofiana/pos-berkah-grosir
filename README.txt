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

auth -> /api/auth/register
{
  "username": "owner_berkah",
  "password": "password123",
  "role": "owner"
}

login (bearer) -> /api/auth/login

category -> /api/categories
{
  "name": "Sembako"
}

product -> /api/products
{
  "category_id": 1,
  "sku": "IDM-MIE-001",
  "name": "Indomie Goreng Spesial",
  "description": "Indomie Goreng isi 40 pcs per dus",
  "base_price": 2800,
  "current_stock_in_pcs": 400,
  "min_stock_limit": 40,
  "units": [
    {
      "unit_name": "Dus",
      "conversion_factor": 40,
      "is_default_selling": true,
      "prices": [
        { "price": 108000, "min_qty": 1 },
        { "price": 105000, "min_qty": 10 }
      ]
    },
    {
      "unit_name": "Pcs",
      "conversion_factor": 1,
      "is_default_selling": false,
      "prices": [
        { "price": 3000, "min_qty": 1 },
        { "price": 2800, "min_qty": 5 }
      ]
    }
  ]
}

order -> /api/orders
{
  "customer_name": "Budi Santoso",
  "customer_whatsapp": "081234567890",
  "fulfillment_method": "pickup",
  "payment_method": "midtrans_online",
  "items": [
    {
      "product_id": 1,
      "unit_id": 1,
      "qty": 2,
      "price_per_unit": 108000
    }
  ]
}

notification Midtrans -> /api/payments/notification
{
  "customer_name": "Budi Santoso",
  "customer_whatsapp": "081234567890",
  "fulfillment_method": "pickup",
  "payment_method": "midtrans_online",
  "items": [
    {
      "product_id": 1,
      "unit_id": 1,
      "qty": 2,
      "price_per_unit": 108000
    }
  ]
}

riwayat / stock log -> /api/stocks?product_id=1


src/
├── api/          # Konfigurasi Axios
├── components/   # UI Reusable (Button, Input, Card)
├── context/      # AuthContext, CartContext
├── layouts/      # Layout Admin (Sidebar + Header)
├── pages/        # Halaman Utama (Login, Dashboard, Catalog)
├── utils/        # Formatter Rupiah, Tanggal
└── App.jsx

<layout xmlns: android="http://schemas.android.com/apk/res/android" xmlns:app="http://schemas.android.com/apk/res-auto">

<androidx.constraintlayout.widget.ConstraintLayout

android:layout_width="match_parent"

android:layout_height="wrap_content"

android:padding="16dp">

<TextView

android:id="@+id/text_view"

android:layout_width="0dp"

android:layout_height="wrap_content"

android:textSize="16sp"

app:layout_constraintEnd_toEnd0f="parent"

app:layout_constraintStart_toStart0f="parent"

app:layout_constraintTop_toTop0f="parent" />

<TextView

android:id="@+id/text_view2"

android:layout_width="Odp"

android:layout_height="wrap_content"

android:textSize="14sp"

app:layout_constraintEnd_toEndOf="parent"

app:layout_constraintStart_toStart0f="parent"

app:layout_constraintTop_toBottomOf="@id/text_view"

/>

</androidx.constraintlayout.widget.ConstraintLayout>

</lavout>
