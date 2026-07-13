import { customersHandlers } from './customers.handlers'
import { ordersHandlers } from './orders.handlers'
import { productsHandlers } from './products.handlers'

export const handlers = [...ordersHandlers, ...productsHandlers, ...customersHandlers]
