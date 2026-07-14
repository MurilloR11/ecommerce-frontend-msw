/**
 * Static mock-data generato.
 *
 * Runs in plain Node via `npm run generate:data` (tsx). Nothing here is
 * imported by the client app — only domain *types* are pulled from
 * `src/entities/*` so the generated JSON is guaranteed to satisfy the same
 * contracts the app consumes at runtime.
 *
 * Generation order is load-bearing: products must exist before orders can
 * reference them, and customers must exist before orders can be attributed
 * to them. Customer aggregates (ordersCount/totalSpent/segment) are only
 * knowable *after* all orders exist, so that pass runs last, followed by an
 * audit that re-derives every aggregate independently and diffs it against
 * what was written — a mismatch aborts the run before any file is touched.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { faker } from "@faker-js/faker";

import type { Product, ProductCategory, ProductStatus } from "../src/entities/product";
import { PRODUCT_CATEGORIES } from "../src/entities/product/model/types";
import type { Customer, CustomerSegment } from "../src/entities/customer";
import type { CustomerOrderSnapshot } from "../src/entities/customer/@x/order";
import type { Order, OrderItem, OrderStatus, PaymentMethod, Currency } from "../src/entities/order";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const PRODUCT_COUNT = 80;
const CUSTOMER_COUNT = 200;
const ORDER_COUNT = 5000;
const MONTHS_BACK = 18;

/** Share of customers deliberately excluded from order assignment, so the
 * "new" segment (ordersCount === 0) is guaranteed to be non-empty instead of
 * only ever arising from a lucky roll. */
const RESERVED_NEW_CUSTOMER_RATIO = 0.06;
/** Orders older than this can no longer sit in an in-flight status.
 *
 * 30 days was tried first and technically respects the "no pending/shipped
 * once aged" rule, but it shrinks the in-flight population to ~30 of ~548
 * days of history (~5%): out of 5000 orders that left only ~65-75 each in
 * "shipped"/"paid"/"pending". A dashboard's most important filter — "orders
 * awaiting action" — would then never show more than a couple hundred rows
 * out of the whole dataset, which doesn't exercise a table built to
 * virtualize thousands. 90 days is still coherent (an order can plausibly
 * sit "shipped" for three months on slow/international logistics) and
 * roughly triples the in-flight pool. */
const RECENT_WINDOW_DAYS = 90;

const FREE_SHIPPING_THRESHOLD_CENTS = 10_000; // $100.00
const FLAT_SHIPPING_CENTS = 599;
const TAX_RATE = 0.08;

const OUTPUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/shared/mocks/data");

faker.seed(12345);
/** Anchored to local midnight, not the exact instant: the run must be
 * byte-identical for any invocation on the same calendar day, and the
 * spec's "desde la fecha actual" only needs day-level granularity anyway —
 * a millisecond-precise `new Date()` would make two runs seconds apart
 * diverge even though nothing about the dataset actually should. */
const NOW = new Date();
NOW.setHours(0, 0, 0, 0);

/* ------------------------------------------------------------------ */
/* Generic helpers                                                     */
/* ------------------------------------------------------------------ */

function daysAgo(date: Date): number {
  return Math.floor((NOW.getTime() - date.getTime()) / 86_400_000);
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

/**
 * Log-normal-ish multiplier centered on 1 via Box-Muller, built entirely on
 * faker's seeded RNG so it stays reproducible. Used to fatten the right tail
 * of order sizes: most draws land near 1x, rare draws spike much higher,
 * which is what turns a handful of orders into outlier "VIP" baskets.
 */
function lognormalMultiplier(mu: number, sigma: number): number {
  const u1 = faker.number.float({ min: 0.0001, max: 0.9999, fractionDigits: 6 });
  const u2 = faker.number.float({ min: 0.0001, max: 0.9999, fractionDigits: 6 });
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(mu + sigma * z);
}

/* ------------------------------------------------------------------ */
/* Step 1: Products                                                    */
/* ------------------------------------------------------------------ */

/** Exhaustive switch instead of a `Record` lookup so `noUncheckedIndexedAccess`
 * can't force a spurious `| undefined` onto the range. */
function priceRangeForCategory(category: ProductCategory): [min: number, max: number] {
  switch (category) {
    case "electronics":
      return [999, 17_999];
    case "apparel":
      return [499, 4_999];
    case "home":
      return [399, 7_499];
    case "beauty":
      return [299, 1_999];
    case "sports":
      return [499, 6_499];
    case "toys":
      return [299, 2_499];
  }
}

const PRODUCT_STATUS_WEIGHTS: readonly { value: ProductStatus; weight: number }[] = [
  { value: "active", weight: 80 },
  { value: "draft", weight: 10 },
  { value: "discontinued", weight: 10 },
];

function generateProducts(count: number): Product[] {
  const products: Product[] = [];
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(PRODUCT_CATEGORIES);
    const [min, max] = priceRangeForCategory(category);
    const createdAt = faker.date.past({ years: 2, refDate: NOW });
    const updatedAt = faker.date.between({ from: createdAt, to: NOW });

    products.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      sku: `SKU-${faker.string.alphanumeric({ length: 8, casing: "upper" })}`,
      category,
      status: faker.helpers.weightedArrayElement(PRODUCT_STATUS_WEIGHTS),
      price: faker.number.int({ min, max }),
      stock: faker.number.int({ min: 0, max: 500 }),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  }
  return products;
}

/* ------------------------------------------------------------------ */
/* Step 2: Customers (accumulators seeded at 0, resolved in step 4)    */
/* ------------------------------------------------------------------ */

function generateCustomers(count: number): Customer[] {
  const customers: Customer[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const createdAt = faker.date.past({ years: 2, refDate: NOW });

    customers.push({
      id: faker.string.uuid(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      segment: "new",
      isActive: faker.datatype.boolean({ probability: 0.85 }),
      country: faker.location.countryCode(),
      totalSpent: 0,
      ordersCount: 0,
      createdAt: createdAt.toISOString(),
    });
  }
  return customers;
}

/* ------------------------------------------------------------------ */
/* Step 3: Orders                                                       */
/* ------------------------------------------------------------------ */

interface MonthBucket {
  start: Date;
  end: Date;
  weight: number;
}

/** Builds one bucket per calendar month over the trailing window, weighted
 * to spike in Nov/Dec (Black Friday, Christmas) and slump in January. */
function buildMonthBuckets(monthsBack: number, now: Date): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let offset = monthsBack - 1; offset >= 0; offset--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthEndCandidate = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23, 59, 59, 999);
    const end = monthEndCandidate.getTime() > now.getTime() ? now : monthEndCandidate;
    const start = monthStart.getTime() > end.getTime() ? end : monthStart;

    const monthIndex = monthStart.getMonth(); // 0 = January, 10 = November, 11 = December
    let weight = 1;
    if (monthIndex === 10) weight = 2.2;
    if (monthIndex === 11) weight = 3;
    if (monthIndex === 0) weight = 0.35;

    buckets.push({ start, end, weight });
  }
  return buckets;
}

function pickOrderCreatedAt(bucketWeights: readonly { value: MonthBucket; weight: number }[]): Date {
  const bucket = faker.helpers.weightedArrayElement(bucketWeights);
  if (bucket.end.getTime() <= bucket.start.getTime()) return bucket.start;
  return faker.date.between({ from: bucket.start, to: bucket.end });
}

const FULL_STATUS_WEIGHTS: readonly { value: OrderStatus; weight: number }[] = [
  { value: "delivered", weight: 50 },
  { value: "shipped", weight: 15 },
  { value: "paid", weight: 15 },
  { value: "pending", weight: 10 },
  { value: "cancelled", weight: 7 },
  { value: "refunded", weight: 3 },
];

/** Declared independently of FULL_STATUS_WEIGHTS on purpose — filtering that
 * list down to {delivered, cancelled, refunded} and letting weightedArrayElement
 * renormalize was tried first and was wrong: dropping pending/paid/shipped
 * from the competition inflates cancelled/refunded's *relative* share (7 and
 * 3 out of a 100-point scale become 7 and 3 out of a 60-point scale, i.e.
 * ~12% and ~5%), which produced an 11%-cancellation storefront with eight
 * times more cancelled orders than shipped ones — not realistic for any
 * e-commerce business. These weights are the real target rates for a
 * settled order: the vast majority delivered, a small single-digit slice
 * cancelled, fewer still refunded.
 *
 * Note on the resulting aggregate: FULL_STATUS_WEIGHTS' 50/15/15/10/7/3 mix
 * only applies within the last RECENT_WINDOW_DAYS. Across all 5000 orders
 * the mix still skews toward "delivered" because most of an 18-month
 * history has had time to settle — that skew is intended, not a bug. */
const RESOLVED_STATUS_WEIGHTS: readonly { value: OrderStatus; weight: number }[] = [
  { value: "delivered", weight: 95 },
  { value: "cancelled", weight: 3 },
  { value: "refunded", weight: 2 },
];

function pickOrderStatus(createdAt: Date): OrderStatus {
  const weights = daysAgo(createdAt) > RECENT_WINDOW_DAYS ? RESOLVED_STATUS_WEIGHTS : FULL_STATUS_WEIGHTS;
  return faker.helpers.weightedArrayElement(weights);
}

function pickUpdatedAt(createdAt: Date, status: OrderStatus): Date {
  if (status === "pending") return createdAt;
  const maxProgressDays = status === "delivered" || status === "refunded" ? 14 : 7;
  const progressDays = faker.number.int({ min: 0, max: maxProgressDays });
  const candidate = new Date(createdAt.getTime() + progressDays * 86_400_000);
  return candidate.getTime() > NOW.getTime() ? NOW : candidate;
}

const CURRENCY_WEIGHTS: readonly { value: Currency; weight: number }[] = [
  { value: "USD", weight: 70 },
  { value: "EUR", weight: 20 },
  { value: "GBP", weight: 10 },
];

const PAYMENT_METHOD_WEIGHTS: readonly { value: PaymentMethod; weight: number }[] = [
  { value: "credit_card", weight: 55 },
  { value: "paypal", weight: 25 },
  { value: "bank_transfer", weight: 12 },
  { value: "cash_on_delivery", weight: 8 },
];

/** Distinct-product-count per order, biased toward small baskets (1-5 SKUs,
 * as required). */
const ITEM_COUNT_WEIGHTS: readonly { value: number; weight: number }[] = [
  { value: 1, weight: 45 },
  { value: 2, weight: 30 },
  { value: 3, weight: 15 },
  { value: 4, weight: 7 },
  { value: 5, weight: 3 },
];

/** Per-item quantity on an ordinary order: almost always 1, rarely more. */
const QUANTITY_WEIGHTS: readonly { value: number; weight: number }[] = [
  { value: 1, weight: 80 },
  { value: 2, weight: 13 },
  { value: 3, weight: 4 },
  { value: 4, weight: 2 },
  { value: 5, weight: 1 },
];

/** Share of orders that are bulk/VIP baskets: the log-normal multiplier is
 * applied once per order (not per item, which would compound across up to 5
 * items and drag the *median* up instead of just fattening the tail). This
 * is what produces the "few extremely high, many low/medium" long tail. */
const BULK_ORDER_PROBABILITY = 0.025;

function buildOrderItems(products: readonly Product[]): OrderItem[] {
  const distinctCount = faker.helpers.weightedArrayElement(ITEM_COUNT_WEIGHTS);
  const chosenProducts = faker.helpers.arrayElements(products, distinctCount);
  const isBulkOrder = faker.datatype.boolean({ probability: BULK_ORDER_PROBABILITY });
  const bulkMultiplier = isBulkOrder ? lognormalMultiplier(1.3, 0.7) : 1;

  return chosenProducts.map((product) => {
    const baseQuantity = faker.helpers.weightedArrayElement(QUANTITY_WEIGHTS);
    const quantity = clampInt(baseQuantity * bulkMultiplier, 1, 80);
    const total = quantity * product.price;

    const item: OrderItem = {
      id: faker.string.uuid(),
      productId: product.id,
      name: product.name,
      quantity,
      price: product.price,
      total,
    };
    return item;
  });
}

function computeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
}

function computeTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE);
}

interface WeightedCustomer {
  customer: Customer;
  weight: number;
}

/** Archetype base weights for order frequency: most customers buy
 * occasionally, a minority are regulars, and a small minority are frequent
 * buyers. A single unbounded log-normal weight per customer was tried first
 * and rejected — with 5000 orders spread over ~180 buyers (mean ~28/buyer)
 * it let one customer absorb up to 20%+ of all orders, which reads as a
 * data bug rather than a "vip" segment. Tiering bounds that concentration
 * while still leaving the top tier weighted far above the bottom one.
 *
 * The gap between tiers is deliberately wide: with mean orders/customer
 * fixed at ~28 by the 200-customer/5000-order scale the task specifies,
 * keeping the "occasional" share of total order volume small is what keeps
 * most customers' ordersCount low — a prerequisite for "vip" (see
 * computeVipSpendThreshold below) staying a minority instead of swallowing
 * half the customer base. */
const CUSTOMER_TIER_WEIGHTS: readonly { value: number; weight: number }[] = [
  { value: 1.1, weight: 82 }, // occasional
  { value: 8, weight: 14 }, // regular
  { value: 300, weight: 4 }, // frequent
];

/** Excludes the reserved "always new" slice, and gives the rest an
 * archetype-scaled, log-normal-jittered order-frequency weight so a
 * minority of customers naturally rack up many orders (candidates for
 * "vip") while most stay low. */
function buildOrderableCustomers(customers: readonly Customer[]): WeightedCustomer[] {
  const reservedCount = Math.round(customers.length * RESERVED_NEW_CUSTOMER_RATIO);
  const reserved = new Set(faker.helpers.arrayElements(customers, reservedCount).map((customer) => customer.id));

  return customers
    .filter((customer) => !reserved.has(customer.id))
    .map((customer) => {
      const tierBase = faker.helpers.weightedArrayElement(CUSTOMER_TIER_WEIGHTS);
      return { customer, weight: tierBase * lognormalMultiplier(0, 0.15) };
    });
}

function pickCustomerForOrder(orderable: readonly WeightedCustomer[], orderCreatedAt: Date): Customer {
  const eligible = orderable.filter(
    (entry) => new Date(entry.customer.createdAt).getTime() <= orderCreatedAt.getTime(),
  );
  const pool = eligible.length > 0 ? eligible : orderable;
  return faker.helpers.weightedArrayElement(pool.map((entry) => ({ value: entry.customer, weight: entry.weight })));
}

function generateOrders(products: readonly Product[], customers: readonly Customer[]): Order[] {
  const bucketWeights = buildMonthBuckets(MONTHS_BACK, NOW).map((bucket) => ({ value: bucket, weight: bucket.weight }));
  const orderableCustomers = buildOrderableCustomers(customers);

  const orders: Order[] = [];
  for (let i = 0; i < ORDER_COUNT; i++) {
    const createdAt = pickOrderCreatedAt(bucketWeights);
    const status = pickOrderStatus(createdAt);
    const updatedAt = pickUpdatedAt(createdAt, status);
    const customer = pickCustomerForOrder(orderableCustomers, createdAt);

    const items = buildOrderItems(products);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = computeShipping(subtotal);
    const tax = computeTax(subtotal);
    const totalAmount = subtotal + shipping + tax;

    const customerSnapshot: CustomerOrderSnapshot = {
      name: customer.name,
      email: customer.email,
    };

    orders.push({
      id: faker.string.uuid(),
      orderNumber: `ORD-${pad(i + 1, 6)}`,
      customerId: customer.id,
      customerSnapshot,
      status,
      paymentMethod: faker.helpers.weightedArrayElement(PAYMENT_METHOD_WEIGHTS),
      currency: faker.helpers.weightedArrayElement(CURRENCY_WEIGHTS),
      items,
      itemsCount,
      subtotal,
      shipping,
      tax,
      totalAmount,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  }
  return orders;
}

/* ------------------------------------------------------------------ */
/* Step 4: Customer aggregates + segmentation                          */
/* ------------------------------------------------------------------ */

/** "Exceptional" is derived from the dataset itself, not a flat dollar
 * figure picked before any data existed. A fixed threshold (e.g. $500) has
 * no fixed relationship to what "vip" should mean once actual order
 * economics are baked in — with this catalog's pricing and ~28 orders/
 * customer average, $500 turned out trivial to clear with just 3 orders,
 * making "vip" ~24% of customers instead of a distinguishable minority.
 * Sizing the bar off the top slice of the *actual* totalSpent distribution
 * keeps "vip" rare (~top 8%) regardless of later catalog/order-mix tuning. */
const VIP_SPEND_PERCENTILE = 0.92;

function computeVipSpendThreshold(totalSpentValues: readonly number[]): number {
  const sorted = [...totalSpentValues].sort((a, b) => a - b);
  const idx = clampInt(sorted.length * VIP_SPEND_PERCENTILE, 0, sorted.length - 1);
  return sorted[idx] ?? 0;
}

/** Lifetime totals count every order regardless of status (mirrors the
 * literal "todas sus órdenes" requirement) — a different, narrower concept
 * than the platform-level revenue aggregate in entities/order/model/query.ts,
 * which excludes pending/cancelled/refunded. */
function resolveSegment(ordersCount: number, totalSpent: number, vipThreshold: number): CustomerSegment {
  if (ordersCount === 0) return "new";
  if (ordersCount >= 3 && totalSpent >= vipThreshold) return "vip";
  return "returning";
}

function groupOrdersByCustomer(orders: readonly Order[]): Map<string, Order[]> {
  const grouped = new Map<string, Order[]>();
  for (const order of orders) {
    const bucket = grouped.get(order.customerId);
    if (bucket) {
      bucket.push(order);
    } else {
      grouped.set(order.customerId, [order]);
    }
  }
  return grouped;
}

function applyCustomerAggregates(customers: Customer[], orders: readonly Order[]): void {
  const ordersByCustomer = groupOrdersByCustomer(orders);

  for (const customer of customers) {
    const customerOrders = ordersByCustomer.get(customer.id) ?? [];
    customer.ordersCount = customerOrders.length;
    customer.totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  const vipThreshold = computeVipSpendThreshold(customers.map((customer) => customer.totalSpent));
  for (const customer of customers) {
    customer.segment = resolveSegment(customer.ordersCount, customer.totalSpent, vipThreshold);
  }
}

/* ------------------------------------------------------------------ */
/* Step 5: Coherence audit                                             */
/* ------------------------------------------------------------------ */

interface AuditIssue {
  scope: "order" | "customer";
  id: string;
  message: string;
}

function auditOrders(products: readonly Product[], customers: readonly Customer[], orders: readonly Order[]): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const productIds = new Set(products.map((product) => product.id));
  const customerIds = new Set(customers.map((customer) => customer.id));

  for (const order of orders) {
    const expectedSubtotal = order.items.reduce((sum, item) => sum + item.total, 0);
    const expectedItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    for (const item of order.items) {
      if (item.total !== item.quantity * item.price) {
        issues.push({
          scope: "order",
          id: order.id,
          message: `item ${item.id} total mismatch: expected ${item.quantity * item.price}, got ${item.total}`,
        });
      }
      if (!productIds.has(item.productId)) {
        issues.push({ scope: "order", id: order.id, message: `item ${item.id} references unknown productId ${item.productId}` });
      }
    }

    if (order.subtotal !== expectedSubtotal) {
      issues.push({ scope: "order", id: order.id, message: `subtotal mismatch: expected ${expectedSubtotal}, got ${order.subtotal}` });
    }
    if (order.itemsCount !== expectedItemsCount) {
      issues.push({ scope: "order", id: order.id, message: `itemsCount mismatch: expected ${expectedItemsCount}, got ${order.itemsCount}` });
    }
    if (order.totalAmount !== order.subtotal + order.shipping + order.tax) {
      issues.push({
        scope: "order",
        id: order.id,
        message: `totalAmount mismatch: expected ${order.subtotal + order.shipping + order.tax}, got ${order.totalAmount}`,
      });
    }
    if (!customerIds.has(order.customerId)) {
      issues.push({ scope: "order", id: order.id, message: `references unknown customerId ${order.customerId}` });
    }
  }

  return issues;
}

function auditCustomers(customers: readonly Customer[], orders: readonly Order[]): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const ordersByCustomer = groupOrdersByCustomer(orders);

  // Re-derived independently from raw orders, not read off `customer` —
  // otherwise the audit would just be comparing the generator's output
  // against itself instead of against ground truth.
  const expectedByCustomer = customers.map((customer) => {
    const customerOrders = ordersByCustomer.get(customer.id) ?? [];
    return {
      customer,
      ordersCount: customerOrders.length,
      totalSpent: customerOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    };
  });
  const vipThreshold = computeVipSpendThreshold(expectedByCustomer.map((entry) => entry.totalSpent));

  for (const { customer, ordersCount: expectedOrdersCount, totalSpent: expectedTotalSpent } of expectedByCustomer) {
    const expectedSegment = resolveSegment(expectedOrdersCount, expectedTotalSpent, vipThreshold);

    if (customer.ordersCount !== expectedOrdersCount) {
      issues.push({
        scope: "customer",
        id: customer.id,
        message: `ordersCount mismatch: expected ${expectedOrdersCount}, got ${customer.ordersCount}`,
      });
    }
    if (customer.totalSpent !== expectedTotalSpent) {
      issues.push({
        scope: "customer",
        id: customer.id,
        message: `totalSpent mismatch: expected ${expectedTotalSpent}, got ${customer.totalSpent}`,
      });
    }
    if (customer.segment !== expectedSegment) {
      issues.push({
        scope: "customer",
        id: customer.id,
        message: `segment mismatch: expected ${expectedSegment}, got ${customer.segment}`,
      });
    }
  }

  return issues;
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

function main(): void {
  const products = generateProducts(PRODUCT_COUNT);
  const customers = generateCustomers(CUSTOMER_COUNT);
  const orders = generateOrders(products, customers);
  applyCustomerAggregates(customers, orders);

  const issues = [...auditOrders(products, customers, orders), ...auditCustomers(customers, orders)];

  if (issues.length > 0) {
    console.error(`Coherence audit failed with ${issues.length} issue(s). Refusing to write JSON output.`);
    for (const issue of issues.slice(0, 50)) {
      console.error(`  [${issue.scope}:${issue.id}] ${issue.message}`);
    }
    if (issues.length > 50) {
      console.error(`  ...and ${issues.length - 50} more`);
    }
    process.exit(1);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(path.join(OUTPUT_DIR, "products.json"), JSON.stringify(products, null, 2));
  writeFileSync(path.join(OUTPUT_DIR, "customers.json"), JSON.stringify(customers, null, 2));
  writeFileSync(path.join(OUTPUT_DIR, "orders.json"), JSON.stringify(orders, null, 2));

  console.log(`Generated ${products.length} products, ${customers.length} customers, ${orders.length} orders.`);
  console.log("Coherence audit passed: 0 issues.");
}

main();
