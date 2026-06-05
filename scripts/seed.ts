import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

const seedProducts = [
  // CIGARETTES (CIG)
  { product_name: "24/7 GOLD 100's BOX", category: "Cigarettes", sku: "CIG-001", quantity: 48, price: 9.99 },
  { product_name: "24/7 RED 100's BOX", category: "Cigarettes", sku: "CIG-002", quantity: 36, price: 9.99 },
  { product_name: "24/7 SILVER 100's BOX", category: "Cigarettes", sku: "CIG-003", quantity: 24, price: 9.99 },
  { product_name: "American Spirit 100% ORGANIC ROLL YOUR OWN", category: "Cigarettes", sku: "CIG-004", quantity: 18, price: 14.99 },
  { product_name: "American Spirit BALANCED TASTE CELADON", category: "Cigarettes", sku: "CIG-005", quantity: 30, price: 13.49 },
  { product_name: "American Spirit BALANCED TASTE HUNTER", category: "Cigarettes", sku: "CIG-006", quantity: 24, price: 13.49 },
  { product_name: "American Spirit GOLD US GROWN MELLOW", category: "Cigarettes", sku: "CIG-007", quantity: 36, price: 13.49 },
  { product_name: "American Spirit NON-FILTER BROWN", category: "Cigarettes", sku: "CIG-008", quantity: 18, price: 13.99 },
  { product_name: "American Spirit TURQUOISE EARTH DAY 2026", category: "Cigarettes", sku: "CIG-009", quantity: 12, price: 13.99 },
  { product_name: "Camel BLUE WIDES", category: "Cigarettes", sku: "CIG-010", quantity: 42, price: 11.99 },
  { product_name: "Camel FILTERS 99 NINETY NINES", category: "Cigarettes", sku: "CIG-011", quantity: 36, price: 11.99 },
  { product_name: "Camel FILTERS HARDPACK", category: "Cigarettes", sku: "CIG-012", quantity: 54, price: 11.49 },
  { product_name: "Camel ROYAL", category: "Cigarettes", sku: "CIG-013", quantity: 24, price: 12.49 },
  { product_name: "CAPRI MAGENTA SUPERSLIM", category: "Cigarettes", sku: "CIG-014", quantity: 20, price: 10.99 },
  { product_name: "CAPRI VIOLET SUPERSLIM", category: "Cigarettes", sku: "CIG-015", quantity: 16, price: 10.99 },
  { product_name: "CLIPPER CIGARS FULL FLAVOR 100'S", category: "Cigarettes", sku: "CIG-016", quantity: 28, price: 8.99 },
  { product_name: "CLIPPER CIGARS SMOOTH 100'S", category: "Cigarettes", sku: "CIG-017", quantity: 24, price: 8.99 },
  { product_name: "CROWNS 100'S BOX", category: "Cigarettes", sku: "CIG-018", quantity: 20, price: 7.99 },
  { product_name: "DJARUM BLACK", category: "Cigarettes", sku: "CIG-019", quantity: 30, price: 9.49 },
  { product_name: "DJARUM SELECT", category: "Cigarettes", sku: "CIG-020", quantity: 24, price: 9.49 },
  { product_name: "DJARUM SPECIAL", category: "Cigarettes", sku: "CIG-021", quantity: 24, price: 9.49 },
  { product_name: "Marlboro BLACK", category: "Cigarettes", sku: "CIG-022", quantity: 60, price: 12.99 },
  { product_name: "Marlboro BLEND NO.27 100's", category: "Cigarettes", sku: "CIG-023", quantity: 36, price: 12.99 },
  { product_name: "Marlboro FLIP-TOP BOX", category: "Cigarettes", sku: "CIG-024", quantity: 72, price: 12.49 },
  { product_name: "Marlboro REDLABEL 100's", category: "Cigarettes", sku: "CIG-025", quantity: 48, price: 12.99 },
  { product_name: "Marlboro SILVERPACK", category: "Cigarettes", sku: "CIG-026", quantity: 54, price: 12.49 },
  { product_name: "Marlboro SILVERPACK 100's MELLOWFLAVOR", category: "Cigarettes", sku: "CIG-027", quantity: 42, price: 12.99 },
  { product_name: "Marlboro SOUTHERN CUT", category: "Cigarettes", sku: "CIG-028", quantity: 30, price: 12.99 },
  { product_name: "MONTEGO ORANGE 100's BOX", category: "Cigarettes", sku: "CIG-029", quantity: 24, price: 8.49 },
  { product_name: "MONTEGO RED 100's BOX", category: "Cigarettes", sku: "CIG-030", quantity: 30, price: 8.49 },
  { product_name: "NATIVE FULL FLAVOR 100'S BOX", category: "Cigarettes", sku: "CIG-031", quantity: 18, price: 7.99 },
  { product_name: "Newport NONMENTHOL", category: "Cigarettes", sku: "CIG-032", quantity: 48, price: 13.49 },
  { product_name: "Newport NONMENTHOL GOLD", category: "Cigarettes", sku: "CIG-033", quantity: 36, price: 13.49 },
  { product_name: "PALL MALL RED FILTER 100'S BOX", category: "Cigarettes", sku: "CIG-034", quantity: 30, price: 9.49 },
  { product_name: "Parliament FLIPTOP BOX", category: "Cigarettes", sku: "CIG-035", quantity: 36, price: 12.99 },
  { product_name: "Parliament FLIPTOP BOX LIGHTS", category: "Cigarettes", sku: "CIG-036", quantity: 30, price: 12.99 },
  { product_name: "Parliament SILVERPACK", category: "Cigarettes", sku: "CIG-037", quantity: 24, price: 12.49 },
  { product_name: "Rave 100's BOX", category: "Cigarettes", sku: "CIG-038", quantity: 20, price: 7.49 },
  { product_name: "SENEC BLUE 100'S 10PK OF 20", category: "Cigarettes", sku: "CIG-039", quantity: 15, price: 69.99 },
  { product_name: "SENECA FULL FLAVOR 100'S 10PK OF 20", category: "Cigarettes", sku: "CIG-040", quantity: 12, price: 69.99 },
  { product_name: "TALON REGULAR BOX", category: "Cigarettes", sku: "CIG-041", quantity: 20, price: 7.49 },
  { product_name: "TETON NO.18 BLUE KINGS", category: "Cigarettes", sku: "CIG-042", quantity: 18, price: 7.99 },
  { product_name: "TETON NO.18 YELLOW KINGS", category: "Cigarettes", sku: "CIG-043", quantity: 18, price: 7.99 },

  // CIGARS (CGR)
  { product_name: "Black&Mild CASINO", category: "Cigars", sku: "CGR-001", quantity: 60, price: 2.49 },
  { product_name: "Black&Mild JAZZ", category: "Cigars", sku: "CGR-002", quantity: 60, price: 2.49 },
  { product_name: "Black&Mild ORIGINAL", category: "Cigars", sku: "CGR-003", quantity: 80, price: 2.29 },
  { product_name: "Black&Mild SWEETS", category: "Cigars", sku: "CGR-004", quantity: 60, price: 2.49 },
  { product_name: "SHOW CIGARILLOS BLACK NATURAL", category: "Cigars", sku: "CGR-005", quantity: 50, price: 1.99 },
  { product_name: "SHOW CIGARILLOS JAMAICAN BUZZ", category: "Cigars", sku: "CGR-006", quantity: 50, price: 1.99 },
  { product_name: "SHOW CIGARILLOS KOOSH", category: "Cigars", sku: "CGR-007", quantity: 40, price: 1.99 },
  { product_name: "SHOW CIGARILLOS SILVER", category: "Cigars", sku: "CGR-008", quantity: 40, price: 1.99 },
  { product_name: "SHOW CIGARILLOS SWEET", category: "Cigars", sku: "CGR-009", quantity: 50, price: 1.99 },

  // WRAPS (WRP)
  { product_name: "BackWoods BLACK", category: "Wraps", sku: "WRP-001", quantity: 72, price: 3.99 },
  { product_name: "BackWoods BOLD", category: "Wraps", sku: "WRP-002", quantity: 72, price: 3.99 },
  { product_name: "da BossLeaf DARK XO", category: "Wraps", sku: "WRP-003", quantity: 48, price: 4.49 },
  { product_name: "da BossLeaf GASCONSIN MILKY WHITE", category: "Wraps", sku: "WRP-004", quantity: 36, price: 4.49 },
  { product_name: "da BossLeaf GUAVA GLAZE", category: "Wraps", sku: "WRP-005", quantity: 48, price: 4.49 },
  { product_name: "da BossLeaf NATURAL ORIGINAL", category: "Wraps", sku: "WRP-006", quantity: 60, price: 3.99 },
  { product_name: "da BossLeaf O-HIGH PACK LMTD EDTION", category: "Wraps", sku: "WRP-007", quantity: 24, price: 5.49 },
  { product_name: "da BossLeaf PURPLE REIGN", category: "Wraps", sku: "WRP-008", quantity: 48, price: 4.49 },
  { product_name: "da BossLeaf ROYAL BLUE", category: "Wraps", sku: "WRP-009", quantity: 36, price: 4.49 },
  { product_name: "Dutch BLUEDREAM FUSION", category: "Wraps", sku: "WRP-010", quantity: 60, price: 2.99 },
  { product_name: "Dutch DIAMOND FUSION", category: "Wraps", sku: "WRP-011", quantity: 60, price: 2.99 },
  { product_name: "Dutch OG FUSION", category: "Wraps", sku: "WRP-012", quantity: 72, price: 2.79 },
  { product_name: "Dutch PLATINUM FUSION", category: "Wraps", sku: "WRP-013", quantity: 60, price: 2.99 },
  { product_name: "Dutch ROYAL HAZE", category: "Wraps", sku: "WRP-014", quantity: 48, price: 3.19 },
  { product_name: "Dutch SILVER", category: "Wraps", sku: "WRP-015", quantity: 72, price: 2.79 },
  { product_name: "Game DIAMOND", category: "Wraps", sku: "WRP-016", quantity: 60, price: 2.49 },
  { product_name: "game Leaf SWEET AROMATIC", category: "Wraps", sku: "WRP-017", quantity: 72, price: 2.49 },
  { product_name: "GRABBALEAF", category: "Wraps", sku: "WRP-018", quantity: 50, price: 1.99 },
  { product_name: "GRABBALEAF CRUSHED", category: "Wraps", sku: "WRP-019", quantity: 40, price: 2.49 },
  { product_name: "GRABBALEAF WHOLE LEAF", category: "Wraps", sku: "WRP-020", quantity: 40, price: 2.99 },
  { product_name: "HEMPAPILLO ROYAL BLUNTS NAKED", category: "Wraps", sku: "WRP-021", quantity: 48, price: 2.99 },
  { product_name: "HEMPAPILLO ROYAL BLUNTS OGK", category: "Wraps", sku: "WRP-022", quantity: 48, price: 2.99 },
  { product_name: "LooseLeaf COOKIES CINNAMON MILK", category: "Wraps", sku: "WRP-023", quantity: 36, price: 3.49 },
  { product_name: "LooseLeaf LONGLEAF", category: "Wraps", sku: "WRP-024", quantity: 36, price: 3.49 },
  { product_name: "LooseLeaf YELLOWDREAM", category: "Wraps", sku: "WRP-025", quantity: 36, price: 3.49 },
  { product_name: "OG Woods RUSSIAN CREAM", category: "Wraps", sku: "WRP-026", quantity: 60, price: 2.49 },
  { product_name: "OG Woods VANILLA", category: "Wraps", sku: "WRP-027", quantity: 60, price: 2.49 },
  { product_name: "Spliits DIAMOND", category: "Wraps", sku: "WRP-028", quantity: 50, price: 2.99 },
  { product_name: "Splitarillos 18KGOLD", category: "Wraps", sku: "WRP-029", quantity: 60, price: 1.79 },
  { product_name: "Splitarillos PINE EXPRESS", category: "Wraps", sku: "WRP-030", quantity: 60, price: 1.79 },
  { product_name: "SwisherSweets BLACK", category: "Wraps", sku: "WRP-031", quantity: 80, price: 1.49 },
  { product_name: "SwisherSweets CLASSIC", category: "Wraps", sku: "WRP-032", quantity: 100, price: 1.49 },
  { product_name: "SwisherSweets DIAMONDS", category: "Wraps", sku: "WRP-033", quantity: 80, price: 1.79 },
  { product_name: "SwisherSweets GOLD", category: "Wraps", sku: "WRP-034", quantity: 80, price: 1.49 },
  { product_name: "SwisherSweets MINI GOLD", category: "Wraps", sku: "WRP-035", quantity: 100, price: 1.99 },
  { product_name: "SwisherSweets ORIGINAL", category: "Wraps", sku: "WRP-036", quantity: 100, price: 1.49 },
  { product_name: "SwisherSweetsBLK WOODTIP SMOOTH", category: "Wraps", sku: "WRP-037", quantity: 60, price: 1.99 },
  { product_name: "XXL ROYAL BLUNTS HEMP WRAPS NAKED", category: "Wraps", sku: "WRP-038", quantity: 48, price: 2.99 },
  { product_name: "XXL ROYAL BLUNTS HEMP WRAPS NO NICOTINE", category: "Wraps", sku: "WRP-039", quantity: 48, price: 2.99 },
  { product_name: "XXL ROYAL BLUNTS HEMP WRAPS OGK", category: "Wraps", sku: "WRP-040", quantity: 48, price: 2.99 },

  // ROLLING PAPERS (PPR)
  { product_name: "BlazySusan KINGSLIM PINK ROLLING PAPERS", category: "Rolling Papers", sku: "PPR-001", quantity: 36, price: 3.99 },
  { product_name: "Bugler ORIGINAL", category: "Rolling Papers", sku: "PPR-002", quantity: 30, price: 4.49 },
  { product_name: "Bugler ORIGINAL ROLLING PAPERS", category: "Rolling Papers", sku: "PPR-003", quantity: 36, price: 2.99 },
  { product_name: "High Hemp FILTERTIPS HERBALWRAPS BANANA", category: "Rolling Papers", sku: "PPR-004", quantity: 48, price: 3.49 },
  { product_name: "High Hemp FILTERTIPS HERBALWRAPS PINE", category: "Rolling Papers", sku: "PPR-005", quantity: 48, price: 3.49 },
  { product_name: "RAW NATURAL UNREFINED SOFT TIPS", category: "Rolling Papers", sku: "PPR-006", quantity: 60, price: 2.99 },
  { product_name: "RAW NATURAL UNREFINED SOFT TIPS WIDE", category: "Rolling Papers", sku: "PPR-007", quantity: 60, price: 2.99 },

  // LIGHTERS (LTR)
  { product_name: "BIC 50 CLASSIC LIGHTERS + 3 SPECIAL EDITION", category: "Lighters", sku: "LTR-001", quantity: 15, price: 44.99 },
  { product_name: "BOOM YOUR LIGHTER 50PC", category: "Lighters", sku: "LTR-002", quantity: 12, price: 34.99 },
  { product_name: "EAGLE TORCH MINI-ANGLE TORCH", category: "Lighters", sku: "LTR-003", quantity: 24, price: 8.99 },
  { product_name: "KING CLASSIC 50PC DISPOSABLE BUTANE LIGHTER", category: "Lighters", sku: "LTR-004", quantity: 10, price: 29.99 },
  { product_name: "LIGHTER LEASH", category: "Lighters", sku: "LTR-005", quantity: 30, price: 3.99 },

  // BATTERIES (BAT)
  { product_name: "AA DURACEL 4PK", category: "Batteries", sku: "BAT-001", quantity: 36, price: 7.99 },
  { product_name: "AA PANASONIC SUPERHEAVYDUTY", category: "Batteries", sku: "BAT-002", quantity: 24, price: 5.99 },
  { product_name: "AAA DURACEL 4PK", category: "Batteries", sku: "BAT-003", quantity: 30, price: 7.99 },
  { product_name: "AAA PANASONIC SUPERHEAVYDUTY", category: "Batteries", sku: "BAT-004", quantity: 24, price: 5.99 },

  // BUTANE (BUT)
  { product_name: "NEON 11X PREMIUM BUTANE UNIVERSAL REFILL", category: "Butane", sku: "BUT-001", quantity: 24, price: 11.99 },
  { product_name: "NEON 5X PREMIUM BUTANE UNIVERSAL REFILL", category: "Butane", sku: "BUT-002", quantity: 30, price: 7.99 },
  { product_name: "NEON UNIVERSAL GAS LIGHTER REFILL 12 PCS", category: "Butane", sku: "BUT-003", quantity: 18, price: 24.99 },

  // INCENSE (INC)
  { product_name: "SATYA JASMINE INCENSE", category: "Incense", sku: "INC-001", quantity: 60, price: 2.99 },
  { product_name: "SATYA MUSK INCENSE", category: "Incense", sku: "INC-002", quantity: 60, price: 2.99 },
  { product_name: "SATYA OPUM INCENSE", category: "Incense", sku: "INC-003", quantity: 48, price: 2.99 },
  { product_name: "SATYA PALO SANTO INCENSE", category: "Incense", sku: "INC-004", quantity: 60, price: 3.49 },
  { product_name: "SATYA REIKI INCENSE", category: "Incense", sku: "INC-005", quantity: 48, price: 3.49 },
  { product_name: "SATYA SANDALWOOD INCENSE", category: "Incense", sku: "INC-006", quantity: 72, price: 2.99 },
  { product_name: "SATYA VANILLA INCENSE", category: "Incense", sku: "INC-007", quantity: 60, price: 2.99 },

  // MEDICATION (MED)
  { product_name: "ADVIL 200MG IBUPROFEN 50PKTS OF 2", category: "Medication", sku: "MED-001", quantity: 40, price: 12.99 },
  { product_name: "ADVIL LIQUI-GELS 200MG 50 PKTS OF 2", category: "Medication", sku: "MED-002", quantity: 30, price: 13.99 },
  { product_name: "ADVIL PM 200MG IBUPROFEN 50PKTS OF 2", category: "Medication", sku: "MED-003", quantity: 30, price: 12.99 },
  { product_name: "ALEVE 220MG 20 CAPLETS", category: "Medication", sku: "MED-004", quantity: 36, price: 9.99 },
  { product_name: "ALKA SELTZER ORIGINAL 40 TABLETS", category: "Medication", sku: "MED-005", quantity: 24, price: 8.99 },
  { product_name: "BENADRYL ALLERGY 20PKTS OF 2", category: "Medication", sku: "MED-006", quantity: 30, price: 8.49 },
  { product_name: "DAYQUIL SEVERE COLD&FLU 32PKTS OF 2", category: "Medication", sku: "MED-007", quantity: 36, price: 14.99 },
  { product_name: "EXCEDRIN MIGRAINE RELIEF 25PKTS OF 2", category: "Medication", sku: "MED-008", quantity: 30, price: 10.99 },
  { product_name: "MOTRIN IBUPROFEN 200MG 20PKTS OF 2", category: "Medication", sku: "MED-009", quantity: 36, price: 7.99 },
  { product_name: "NYQUIL SEVERE COLD&FLU 32PKTS OF 2", category: "Medication", sku: "MED-010", quantity: 36, price: 14.99 },
  { product_name: "PEPTO BISMOL 32PKTS OF 4", category: "Medication", sku: "MED-011", quantity: 30, price: 9.99 },

  // ACCESSORIES (ACC)
  { product_name: "Hyppe Infinity NAKED", category: "Accessories", sku: "ACC-001", quantity: 20, price: 12.99 },
  { product_name: "PomPom RED", category: "Accessories", sku: "ACC-002", quantity: 30, price: 3.99 },
  { product_name: "PomPom SLOW GLOW", category: "Accessories", sku: "ACC-003", quantity: 30, price: 4.49 },
  { product_name: "RUSH NAIL POLISH REMOVER RED", category: "Accessories", sku: "ACC-004", quantity: 24, price: 5.99 },
  { product_name: "RUSH NAIL POLISH REMOVER YELLOW", category: "Accessories", sku: "ACC-005", quantity: 24, price: 5.99 },

  // EYE CARE (EYE)
  { product_name: "PURE EYES STERILE EYE DROPS", category: "Eye Care", sku: "EYE-001", quantity: 36, price: 5.49 },

  // CONDOMS (CON)
  { product_name: "MAGNUM LARGE SIZE CONDOMS 3", category: "Condoms", sku: "CON-001", quantity: 48, price: 7.99 },
  { product_name: "TROJAN ORIGINAL + SPERMICIDE 3", category: "Condoms", sku: "CON-002", quantity: 48, price: 6.99 },
  { product_name: "TROJAN ULTRATHIN", category: "Condoms", sku: "CON-003", quantity: 36, price: 7.49 },
];

async function seed() {
  console.log(`Seeding ${seedProducts.length} products...`);

  // Clear existing data
  await sql`DELETE FROM products`;
  await sql`ALTER SEQUENCE products_id_seq RESTART WITH 1`;

  for (const product of seedProducts) {
    await sql`
      INSERT INTO products (product_name, category, sku, quantity, price)
      VALUES (${product.product_name}, ${product.category}, ${product.sku}, ${product.quantity}, ${product.price})
    `;
  }

  console.log(`✓ Seeded ${seedProducts.length} products successfully!`);

  // Print summary
  const summary = seedProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("\nCategory Summary:");
  Object.entries(summary).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} products`);
  });
}

seed().catch(console.error);
