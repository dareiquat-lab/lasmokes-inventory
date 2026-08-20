---
name: project-profit-feature
description: Profit analytics feature added — cost per product, margin tracking, monthly profit on dashboard, order deletion
metadata:
  type: project
---

Added a full profit analytics system to the admin portal (August 2026).

**Why:** Admin wanted to track cost per product, calculate margins, and see monthly profit from completed orders.

**How to apply:** When touching product forms or order management, be aware these features exist:
- `products.cost` column (NUMERIC, default 0) — added via `ensureProductCostColumn()` idempotent migration
- `/admin/profit` page with 3 views: Overview, By Product (sortable table), By Category
- Dashboard shows monthly profit card + new orders count (replaces categories card, categories moved to 2nd row)
- Orders table has a delete button (trash icon) with confirm modal — calls DELETE `/api/admin/orders/[id]`
- Product form has "Your Cost (Admin Only)" field with Private badge, saves to `cost` column
- Profit API: `/api/admin/profit` returns full profit dataset including category breakdown and monthly stats
- Monthly profit only counts orders with status = 'completed'
- Cost is excluded from storefront queries (`getStorefrontProducts` already uses explicit column list)
