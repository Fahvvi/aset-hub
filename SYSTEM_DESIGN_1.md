# SYSTEM DESIGN — Sistem Manajemen Aset
> Stack: **Laravel 12** · **PostgreSQL** · **React.js**
> Standar acuan: **ISO 55000** (Asset Management), **PSAK 16** (Aset Tetap)

---

## DAFTAR ISI
1. [Ringkasan Sistem](#1-ringkasan-sistem)
2. [Arsitektur Aplikasi](#2-arsitektur-aplikasi)
3. [Skema Database (ERD Perbaikan)](#3-skema-database-erd-perbaikan)
4. [Penjelasan Setiap Tabel](#4-penjelasan-setiap-tabel)
5. [Relasi Antar Tabel](#5-relasi-antar-tabel)
6. [API Endpoint Plan](#6-api-endpoint-plan)
7. [Role & Permission Matrix](#7-role--permission-matrix)
8. [Alur Bisnis Utama](#8-alur-bisnis-utama)
9. [Konvensi Koding](#9-konvensi-koding)
10. [Struktur Folder Project](#10-struktur-folder-project)
11. [Checklist Fitur](#11-checklist-fitur)

---

## 1. RINGKASAN SISTEM

Sistem ini mengelola siklus hidup aset organisasi secara penuh:
**Pengadaan → Pencatatan → Penggunaan → Pemeliharaan → Pemindahan → Penyusutan → Disposal**

### Fitur Inti
- Manajemen data aset (CRUD)
- Manajemen kategori & lokasi (master data)
- Manajemen vendor/supplier
- Pencatatan maintenance & kerusakan
- Penyusutan aset otomatis (metode garis lurus / saldo menurun)
- Pemindahan aset antar lokasi
- Disposal (penghapusan) aset
- Upload dokumen & foto aset
- Audit log semua aktivitas
- Notifikasi (maintenance jatuh tempo, aset mendekati habis masa pakai)
- Dashboard & laporan (PDF/Excel)

---

## 2. ARSITEKTUR APLIKASI

```
┌─────────────────────────────────────────────────┐
│                   CLIENT LAYER                  │
│         React.js + Vite + Tailwind CSS          │
│   (SPA: Dashboard, CRUD, Reports, Notif)        │
└────────────────────┬────────────────────────────┘
                     │ REST API (JSON)
                     │ Authorization: Bearer {token}
┌────────────────────▼────────────────────────────┐
│                  API LAYER                      │
│          Laravel 12 (API Mode)                  │
│   Routes → Controllers → Services → Models     │
│   Sanctum Auth · Policy · FormRequest           │
└────────────────────┬────────────────────────────┘
                     │ Eloquent ORM
┌────────────────────▼────────────────────────────┐
│               DATABASE LAYER                    │
│              PostgreSQL 16+                     │
│   Tables · Indexes · Views · Triggers           │
└─────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│               STORAGE LAYER                     │
│    Laravel Storage (local/S3) — Dokumen, Foto   │
└─────────────────────────────────────────────────┘
```

---

## 3. SKEMA DATABASE (ERD PERBAIKAN)

> Perubahan dari ERD awal:
> - ✅ `Admin` + `User` → digabung jadi `users` (pakai kolom `role`)
> - ✅ `Data_Aset` duplikat → dijadikan satu tabel `assets`
> - ✅ `kategori` string → tabel master `categories`
> - ✅ `lokasi` string → tabel master `locations`
> - ➕ Tambah: `vendors`, `asset_depreciation`, `asset_transfers`, `asset_disposals`, `documents`, `audit_logs`, `notifications`

### Diagram Relasi (Teks)

```
users ──────────────────────────────────────────────────┐
  │ 1:N                                                  │
  ▼                                                      │
assets ──── N:1 ──► categories                          │
  │    └─── N:1 ──► locations                           │
  │    └─── N:1 ──► vendors                             │
  │                                                      │
  ├── 1:N ──► asset_depreciation                        │
  ├── 1:N ──► asset_transfers ──── N:1 ──► locations    │
  ├── 1:N ──► asset_disposals                           │
  ├── 1:N ──► maintenances ──── N:1 ──► users ◄────────┘
  └── 1:N ──► documents

audit_logs ──► polymorphic (semua tabel)
notifications ──► users
```

---

## 4. PENJELASAN SETIAP TABEL

### 4.1 `users`
> Gabungan Admin & User. Role membedakan akses.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `nama` | VARCHAR(100) | Nama lengkap |
| `username` | VARCHAR(50) UNIQUE | Login username |
| `email` | VARCHAR(100) UNIQUE | |
| `password` | VARCHAR(255) | bcrypt hash |
| `role` | ENUM | `superadmin`, `admin`, `staff`, `viewer` |
| `is_active` | BOOLEAN | Default true |
| `last_login_at` | TIMESTAMP | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft delete |

---

### 4.2 `categories`
> Master kategori aset (contoh: Elektronik, Furnitur, Kendaraan)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `kode_kategori` | VARCHAR(20) UNIQUE | Contoh: `ELK`, `FRN` |
| `nama_kategori` | VARCHAR(100) | |
| `deskripsi` | TEXT | |
| `metode_penyusutan` | ENUM | `straight_line`, `declining_balance` |
| `umur_ekonomis_tahun` | INTEGER | Estimasi tahun pakai |
| `nilai_sisa_persen` | DECIMAL(5,2) | % nilai sisa dari harga awal |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

### 4.3 `locations`
> Master lokasi / ruangan / gedung

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `kode_lokasi` | VARCHAR(20) UNIQUE | Contoh: `GD-A-101` |
| `nama_lokasi` | VARCHAR(100) | |
| `gedung` | VARCHAR(100) | |
| `lantai` | VARCHAR(20) | |
| `deskripsi` | TEXT | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

### 4.4 `vendors`
> Master vendor / supplier pengadaan aset

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `kode_vendor` | VARCHAR(20) UNIQUE | |
| `nama_vendor` | VARCHAR(150) | |
| `kontak_person` | VARCHAR(100) | |
| `telepon` | VARCHAR(20) | |
| `email` | VARCHAR(100) | |
| `alamat` | TEXT | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

### 4.5 `assets` ⭐ (Tabel Utama)
> Data aset lengkap sesuai standar PSAK 16

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `kode_aset` | VARCHAR(30) UNIQUE | Auto-generate, contoh: `AST-ELK-2024-001` |
| `nama_aset` | VARCHAR(150) | |
| `category_id` | BIGINT FK → categories | |
| `location_id` | BIGINT FK → locations | |
| `vendor_id` | BIGINT FK → vendors | Nullable |
| `user_id` | BIGINT FK → users | Penanggung jawab aset |
| `tanggal_pembelian` | DATE | |
| `tanggal_aktif` | DATE | Mulai digunakan |
| `masa_pakai_tahun` | INTEGER | Override dari kategori jika beda |
| `harga_perolehan` | DECIMAL(15,2) | Harga beli awal |
| `nilai_sisa` | DECIMAL(15,2) | Nilai sisa estimasi |
| `jumlah` | INTEGER | Default 1 |
| `satuan` | VARCHAR(30) | unit, set, buah, dll |
| `nomor_seri` | VARCHAR(100) | Nullable |
| `nomor_inventaris` | VARCHAR(100) | Nullable |
| `kondisi` | ENUM | `baik`, `rusak_ringan`, `rusak_berat` |
| `status` | ENUM | `aktif`, `tidak_aktif`, `dalam_perbaikan`, `disposal` |
| `keterangan` | TEXT | |
| `created_by` | BIGINT FK → users | |
| `updated_by` | BIGINT FK → users | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft delete |

---

### 4.6 `asset_depreciation`
> Penyusutan aset per tahun/bulan (otomatis via scheduler)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `asset_id` | BIGINT FK → assets | |
| `periode` | DATE | Tanggal periode (misal: 2024-12-31) |
| `nilai_awal_periode` | DECIMAL(15,2) | Nilai buku awal periode |
| `beban_penyusutan` | DECIMAL(15,2) | Penyusutan periode ini |
| `akumulasi_penyusutan` | DECIMAL(15,2) | Total akumulasi s/d periode |
| `nilai_buku` | DECIMAL(15,2) | Nilai buku akhir periode |
| `metode` | ENUM | `straight_line`, `declining_balance` |
| `created_at` | TIMESTAMP | |

---

### 4.7 `maintenances`
> Riwayat perawatan & perbaikan aset

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `kode_maintenance` | VARCHAR(30) UNIQUE | Auto-generate |
| `asset_id` | BIGINT FK → assets | |
| `requested_by` | BIGINT FK → users | Yang mengajukan |
| `handled_by` | BIGINT FK → users | Nullable, teknisi |
| `tipe` | ENUM | `preventif`, `korektif` |
| `tanggal_laporan` | DATE | |
| `tanggal_mulai` | DATE | Nullable |
| `tanggal_selesai` | DATE | Nullable |
| `deskripsi_kerusakan` | TEXT | |
| `tindakan_perbaikan` | TEXT | Nullable, diisi saat selesai |
| `biaya_perbaikan` | DECIMAL(15,2) | Nullable |
| `status` | ENUM | `pending`, `diproses`, `selesai`, `dibatalkan` |
| `keterangan` | TEXT | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

### 4.8 `asset_transfers`
> Riwayat pemindahan aset antar lokasi / penanggung jawab

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `asset_id` | BIGINT FK → assets | |
| `dari_location_id` | BIGINT FK → locations | |
| `ke_location_id` | BIGINT FK → locations | |
| `dari_user_id` | BIGINT FK → users | PJ sebelumnya |
| `ke_user_id` | BIGINT FK → users | PJ baru |
| `tanggal_transfer` | DATE | |
| `alasan` | TEXT | |
| `disetujui_oleh` | BIGINT FK → users | Nullable |
| `status` | ENUM | `pending`, `disetujui`, `ditolak` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

### 4.9 `asset_disposals`
> Penghapusan / pelepasan aset (dijual, rusak total, hibah)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `asset_id` | BIGINT FK → assets | |
| `tanggal_disposal` | DATE | |
| `metode_disposal` | ENUM | `dijual`, `dihapus`, `dihibahkan`, `rusak_total` |
| `nilai_disposal` | DECIMAL(15,2) | Nilai jual/realisasi |
| `alasan` | TEXT | |
| `disetujui_oleh` | BIGINT FK → users | |
| `dokumen_referensi` | VARCHAR(100) | No. SK / Berita Acara |
| `created_by` | BIGINT FK → users | |
| `created_at` | TIMESTAMP | |

---

### 4.10 `documents`
> Dokumen & foto pendukung (polymorphic)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `documentable_type` | VARCHAR(100) | `App\Models\Asset`, dll (polymorphic) |
| `documentable_id` | BIGINT | ID record terkait |
| `nama_file` | VARCHAR(255) | |
| `tipe_dokumen` | ENUM | `foto`, `faktur`, `garansi`, `sk`, `berita_acara`, `lainnya` |
| `path` | VARCHAR(500) | Path di storage |
| `ukuran_kb` | INTEGER | |
| `mime_type` | VARCHAR(100) | |
| `uploaded_by` | BIGINT FK → users | |
| `created_at` | TIMESTAMP | |

---

### 4.11 `audit_logs`
> Log semua aktivitas penting (polymorphic)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGSERIAL PK | |
| `user_id` | BIGINT FK → users | Siapa yang melakukan |
| `action` | VARCHAR(50) | `create`, `update`, `delete`, `approve`, dll |
| `auditable_type` | VARCHAR(100) | Model yang diubah |
| `auditable_id` | BIGINT | ID record |
| `nilai_lama` | JSONB | Nullable |
| `nilai_baru` | JSONB | Nullable |
| `ip_address` | VARCHAR(45) | |
| `user_agent` | TEXT | |
| `created_at` | TIMESTAMP | |

---

### 4.12 `notifications`
> Notifikasi in-app untuk user

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | UUID PK | Pakai UUID (Laravel default) |
| `type` | VARCHAR(255) | Class notifikasi |
| `notifiable_type` | VARCHAR(255) | |
| `notifiable_id` | BIGINT | |
| `data` | JSONB | Isi notifikasi |
| `read_at` | TIMESTAMP | Nullable |
| `created_at` | TIMESTAMP | |

---

## 5. RELASI ANTAR TABEL

```
users
  hasMany: assets (sebagai user_id / created_by)
  hasMany: maintenances (sebagai requested_by / handled_by)
  hasMany: asset_transfers
  hasMany: audit_logs
  morphMany: notifications

categories
  hasMany: assets

locations
  hasMany: assets
  hasMany: asset_transfers (dari & ke)

vendors
  hasMany: assets

assets
  belongsTo: categories, locations, vendors, users
  hasMany: asset_depreciation
  hasMany: maintenances
  hasMany: asset_transfers
  hasOne: asset_disposals
  morphMany: documents
  morphMany: audit_logs (via observer)

maintenances
  belongsTo: assets, users (requested_by), users (handled_by)

asset_transfers
  belongsTo: assets, locations (dari/ke), users (dari/ke/approver)

documents
  morphTo: assets, maintenances, asset_disposals
```

---

## 6. API ENDPOINT PLAN

> Base URL: `/api/v1`
> Auth: Laravel Sanctum (Bearer Token)

### Auth
```
POST   /auth/login
POST   /auth/logout
GET    /auth/me
PUT    /auth/change-password
```

### Master Data
```
GET|POST        /categories
GET|PUT|DELETE  /categories/{id}

GET|POST        /locations
GET|PUT|DELETE  /locations/{id}

GET|POST        /vendors
GET|PUT|DELETE  /vendors/{id}
```

### Assets
```
GET             /assets                    (list, filter, search, paginate)
POST            /assets                    (create)
GET             /assets/{id}               (detail + relasi)
PUT             /assets/{id}               (update)
DELETE          /assets/{id}               (soft delete)
GET             /assets/{id}/history       (audit log aset)
GET             /assets/{id}/depreciation  (histori penyusutan)
POST            /assets/{id}/documents     (upload dokumen/foto)
```

### Maintenances
```
GET|POST        /maintenances
GET|PUT|DELETE  /maintenances/{id}
PUT             /maintenances/{id}/status  (update status: diproses/selesai)
```

### Transfers
```
GET|POST        /transfers
GET             /transfers/{id}
PUT             /transfers/{id}/approve
PUT             /transfers/{id}/reject
```

### Disposals
```
GET|POST        /disposals
GET             /disposals/{id}
```

### Depreciation
```
GET             /depreciation              (semua, filter by periode)
POST            /depreciation/calculate    (trigger hitung manual, biasanya via scheduler)
```

### Reports
```
GET             /reports/assets            (laporan daftar aset)
GET             /reports/depreciation      (laporan penyusutan)
GET             /reports/maintenance       (laporan maintenance)
GET             /reports/asset-value       (laporan nilai aset)
GET             /reports/export/excel      (export Excel)
GET             /reports/export/pdf        (export PDF)
```

### Dashboard
```
GET             /dashboard/summary         (ringkasan total aset, nilai, status)
GET             /dashboard/alerts          (aset hampir habis masa pakai, maintenance jatuh tempo)
```

### Users (admin only)
```
GET|POST        /users
GET|PUT|DELETE  /users/{id}
PUT             /users/{id}/toggle-active
```

---

## 7. ROLE & PERMISSION MATRIX

| Fitur | superadmin | admin | staff | viewer |
|---|:---:|:---:|:---:|:---:|
| Kelola User | ✅ | ❌ | ❌ | ❌ |
| Kelola Master Data | ✅ | ✅ | ❌ | ❌ |
| CRUD Aset | ✅ | ✅ | ✅ | ❌ |
| Lihat Aset | ✅ | ✅ | ✅ | ✅ |
| Input Maintenance | ✅ | ✅ | ✅ | ❌ |
| Approve Transfer | ✅ | ✅ | ❌ | ❌ |
| Input Transfer | ✅ | ✅ | ✅ | ❌ |
| Disposal Aset | ✅ | ✅ | ❌ | ❌ |
| Lihat Laporan | ✅ | ✅ | ✅ | ✅ |
| Export Laporan | ✅ | ✅ | ✅ | ❌ |
| Lihat Audit Log | ✅ | ✅ | ❌ | ❌ |
| Kelola Penyusutan | ✅ | ✅ | ❌ | ❌ |

---

## 8. ALUR BISNIS UTAMA

### 8.1 Pengadaan Aset Baru
```
Input form aset → Pilih kategori & lokasi → Upload faktur/foto
→ Sistem auto-generate kode_aset → Simpan → Audit log tercatat
→ Scheduler hitung penyusutan tiap akhir bulan
```

### 8.2 Maintenance Aset
```
Staff lapor kerusakan → Status: PENDING
→ Admin assign teknisi → Status: DIPROSES
→ Teknisi selesai, input tindakan & biaya → Status: SELESAI
→ Status kondisi aset terupdate otomatis
```

### 8.3 Pemindahan Aset
```
Staff ajukan transfer (dari-ke lokasi/PJ) → Status: PENDING
→ Admin review & approve → Status: DISETUJUI
→ Data location_id & user_id di assets terupdate
→ Riwayat transfer tersimpan di asset_transfers
```

### 8.4 Disposal Aset
```
Admin ajukan disposal + alasan + metode
→ Superadmin approve → Status assets berubah: DISPOSAL
→ Nilai disposal dicatat → Laporan disposal tersimpan
```

### 8.5 Penyusutan Otomatis (Scheduler)
```
Setiap akhir bulan → Laravel Scheduler jalan
→ Loop semua aset aktif → Hitung penyusutan sesuai metode
→ Simpan ke asset_depreciation → Update nilai_buku di assets
```

---

## 9. KONVENSI KODING

### Laravel (Backend)
```
- Gunakan Repository Pattern: Controller → Service → Repository → Model
- FormRequest untuk validasi semua input
- Resource/Transformer untuk response API (JsonResource)
- Observer untuk auto audit_log
- Policy untuk authorization per role
- Scheduler untuk penyusutan otomatis (monthly)
- Job/Queue untuk export laporan besar
- Naming: snake_case untuk kolom DB, camelCase untuk variabel PHP
```

### React.js (Frontend)
```
- State management: Zustand atau React Context + useReducer
- HTTP client: Axios dengan interceptor untuk token
- Routing: React Router v6
- UI: Tailwind CSS + shadcn/ui atau Ant Design
- Form: React Hook Form + Zod (validasi)
- Tabel: TanStack Table (react-table v8)
- Chart: Recharts atau ApexCharts
- Export: react-to-pdf / SheetJS di sisi backend
- Naming: PascalCase komponen, camelCase hooks & fungsi
```

### Database
```
- Semua tabel: snake_case
- PK: kolom `id` (BIGSERIAL, bukan UUID kecuali notifications)
- FK: nama_tabel_id (contoh: asset_id, category_id)
- Soft delete: pakai deleted_at (Laravel SoftDeletes)
- Timestamps: selalu ada created_at & updated_at
- Index: buat index pada kolom FK dan kolom yg sering di-filter
```

---

## 10. STRUKTUR FOLDER PROJECT

### Backend (Laravel 12)
```
app/
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── AuthController.php
│   │   ├── AssetController.php
│   │   ├── MaintenanceController.php
│   │   ├── TransferController.php
│   │   ├── DisposalController.php
│   │   ├── DepreciationController.php
│   │   ├── ReportController.php
│   │   └── ...
│   ├── Requests/
│   │   ├── Asset/StoreAssetRequest.php
│   │   └── ...
│   └── Resources/
│       ├── AssetResource.php
│       └── ...
├── Models/
│   ├── User.php
│   ├── Asset.php
│   ├── Category.php
│   ├── Location.php
│   ├── Vendor.php
│   ├── Maintenance.php
│   ├── AssetTransfer.php
│   ├── AssetDisposal.php
│   ├── AssetDepreciation.php
│   ├── Document.php
│   └── AuditLog.php
├── Services/
│   ├── AssetService.php
│   ├── DepreciationService.php
│   ├── ReportService.php
│   └── ...
├── Repositories/
│   ├── AssetRepository.php
│   └── ...
├── Policies/
│   ├── AssetPolicy.php
│   └── ...
├── Observers/
│   └── AssetObserver.php
└── Console/Commands/
    └── CalculateDepreciation.php

database/
├── migrations/
│   ├── create_users_table.php
│   ├── create_categories_table.php
│   ├── create_locations_table.php
│   ├── create_vendors_table.php
│   ├── create_assets_table.php
│   ├── create_asset_depreciation_table.php
│   ├── create_maintenances_table.php
│   ├── create_asset_transfers_table.php
│   ├── create_asset_disposals_table.php
│   ├── create_documents_table.php
│   └── create_audit_logs_table.php
└── seeders/
    ├── UserSeeder.php
    ├── CategorySeeder.php
    └── LocationSeeder.php
```

### Frontend (React.js)
```
src/
├── api/               # Axios instance + endpoint functions
│   ├── axios.js
│   ├── assets.js
│   └── ...
├── components/        # Reusable UI components
│   ├── ui/            # shadcn atau custom base
│   ├── AssetTable.jsx
│   ├── AssetForm.jsx
│   └── ...
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── assets/
│   ├── maintenance/
│   ├── transfers/
│   ├── disposals/
│   ├── reports/
│   └── settings/
├── hooks/             # Custom hooks
│   ├── useAssets.js
│   └── ...
├── store/             # Zustand stores
│   ├── authStore.js
│   └── ...
└── utils/
    ├── formatCurrency.js
    ├── formatDate.js
    └── permissions.js
```

---

## 11. CHECKLIST FITUR

### Phase 1 — Core (Wajib selesai dulu)
- [ ] Setup Laravel 12 API + Sanctum auth
- [ ] Migrasi semua tabel
- [ ] Seeder data awal (user superadmin, kategori default, lokasi default)
- [ ] CRUD Master Data (Kategori, Lokasi, Vendor)
- [ ] CRUD Aset + upload foto/dokumen
- [ ] Auto-generate kode aset
- [ ] Audit log via Observer
- [ ] Setup React + routing + auth flow
- [ ] Halaman daftar & detail aset
- [ ] Dashboard summary

### Phase 2 — Operations
- [ ] Modul Maintenance (lapor, proses, selesai)
- [ ] Modul Transfer Aset
- [ ] Modul Disposal Aset
- [ ] Notifikasi in-app

### Phase 3 — Finance & Reports
- [ ] Kalkulasi penyusutan (service + scheduler)
- [ ] Laporan daftar aset
- [ ] Laporan penyusutan per periode
- [ ] Laporan maintenance
- [ ] Export Excel & PDF

### Phase 4 — Polish
- [ ] Role & permission lengkap (Policy)
- [ ] Filter & search advanced
- [ ] Halaman audit log (admin)
- [ ] QR Code per aset (scan untuk lihat detail)
- [ ] Notifikasi email (maintenance due, aset expiring)

---

## CATATAN PENTING

> **Baca file ini di awal setiap sesi chat baru** agar konteks sistem tetap konsisten.

1. **Kode Aset** — Format: `AST-{KODE_KATEGORI}-{TAHUN}-{NOMOR_URUT}` → contoh: `AST-ELK-2024-0001`
2. **Soft Delete** — Aset tidak pernah benar-benar dihapus dari DB, hanya `deleted_at` diisi
3. **Penyusutan** — Dijalankan via `php artisan depreciation:calculate` yang dijadwalkan tiap tanggal 1 bulan berikutnya
4. **File Storage** — Dokumen/foto disimpan di `storage/app/public/assets/{asset_id}/`
5. **API Versioning** — Semua endpoint di `/api/v1/` untuk kemudahan upgrade ke v2
6. **Timezone** — Set `APP_TIMEZONE=Asia/Jakarta` di `.env`
7. **Currency** — Semua nilai uang dalam **IDR (Rupiah)**, decimal 2 digit

---

*Dokumen ini adalah sumber kebenaran tunggal (single source of truth) untuk pengembangan sistem.*
*Update dokumen ini setiap ada perubahan signifikan pada skema atau arsitektur.*
