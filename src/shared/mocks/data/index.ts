import type { Customer } from '@/entities/customer'
import type { Order } from '@/entities/order'
import type { Product } from '@/entities/product'

import customersJson from './customers.json'
import ordersJson from './orders.json'
import productsJson from './products.json'

/**
 * These fixtures are produced by `scripts/generate-data.ts` directly against
 * the same domain types imported here, so the cast is a static-boundary
 * assertion, not a leap of faith: any shape drift is caught by the
 * generator's own audit pass before the JSON is ever written to disk.
 */
export const customersDb = customersJson as Customer[]
export const ordersDb = ordersJson as Order[]
export const productsDb = productsJson as Product[]
