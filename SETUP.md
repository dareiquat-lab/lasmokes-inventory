# LA Smokes — Inventory System Setup

## Quick Start (Local Development)

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Configure environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and set your `DATABASE_URL` (the only required variable).

### Step 3 — Set up the Neon database
1. Go to https://console.neon.tech and create a free account
2. Create a new project → copy the **Connection string**
3. Paste it as `DATABASE_URL` in `.env.local`
4. Push the schema:
```bash
npm run db:push
```
5. Seed all 138 inventory items:
```bash
npm run seed
```

### Step 4 — Start the development server
```bash
npm run dev
```

Open http://localhost:3000 — the dashboard loads immediately, no login required.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `BLOB_READ_WRITE_TOKEN` | ⚠️ | Needed for image uploads (Vercel Blob) |
| `LOW_STOCK_THRESHOLD` | optional | Items at or below this qty show as low stock. Default: `10` |

---

## Neon Database Setup

1. Create account at https://console.neon.tech
2. **New Project** → give it a name (e.g. "lasmokes")
3. Select region closest to your users
4. Copy the connection string from **Dashboard → Connection Details**
   - Use the **pooled** connection string for production on Vercel
5. Paste into `DATABASE_URL` in `.env.local`
6. Run: `npm run db:push` then `npm run seed`

---

## Image Uploads — Vercel Blob

Image uploads require Vercel Blob storage. Without it the upload button returns an error — all other features work fine.

1. Deploy to Vercel (even a draft deployment works)
2. In Vercel Dashboard → **Storage** → **Create Database** → **Blob**
3. Connect it to your project
4. Run `vercel env pull .env.local` to pull `BLOB_READ_WRITE_TOKEN` locally

Products without images display a category icon automatically.

---

## Vercel Deployment

```bash
vercel --prod
```

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:
- `DATABASE_URL` — your Neon **pooled** connection string
- `BLOB_READ_WRITE_TOKEN` — added automatically when you connect Blob storage
- `LOW_STOCK_THRESHOLD` — optional, defaults to `10`

---

## Project Structure

```
LASMOKES/
├── app/
│   ├── (dashboard)/           # All app pages
│   │   ├── page.tsx           # Dashboard home
│   │   ├── inventory/         # Full inventory table
│   │   ├── low-stock/         # Low stock alert page
│   │   └── products/
│   │       ├── new/           # Add product
│   │       └── [id]/          # Edit product
│   └── api/
│       ├── products/          # CRUD + bulk actions
│       ├── upload/            # Image uploads → Vercel Blob
│       ├── export/            # CSV / JSON export
│       └── dashboard/         # Dashboard stats
├── components/
│   ├── dashboard/             # DashboardClient with charts
│   ├── inventory/             # InventoryClient, LowStockClient
│   ├── layout/                # Sidebar, Header
│   ├── products/              # ProductFormWrapper, ImageUpload
│   └── ui/                    # Modal, Badge, CategoryIcon
├── lib/
│   ├── db.ts                  # Neon DB client + all queries
│   └── utils.ts               # Helpers
├── scripts/
│   ├── schema.ts              # Creates DB tables (npm run db:push)
│   └── seed.ts                # Seeds 138 products (npm run seed)
└── types/index.ts             # Shared TypeScript types
```

---

## Inventory Summary (138 products seeded)

| Category | Products | SKU Prefix |
|---|---|---|
| Cigarettes | 43 | CIG-001 → CIG-043 |
| Wraps | 40 | WRP-001 → WRP-040 |
| Medication | 11 | MED-001 → MED-011 |
| Cigars | 9 | CGR-001 → CGR-009 |
| Incense | 7 | INC-001 → INC-007 |
| Rolling Papers | 7 | PPR-001 → PPR-007 |
| Lighters | 5 | LTR-001 → LTR-005 |
| Accessories | 5 | ACC-001 → ACC-005 |
| Batteries | 4 | BAT-001 → BAT-004 |
| Butane | 3 | BUT-001 → BUT-003 |
| Condoms | 3 | CON-001 → CON-003 |
| Eye Care | 1 | EYE-001 |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Create/update database schema |
| `npm run seed` | Seed all 138 products |
