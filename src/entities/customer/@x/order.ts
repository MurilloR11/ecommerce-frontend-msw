import type { Customer } from "../model/types";

/**
 * FSD cross-import surface: the only shape of `customer` that entities/order
 * may depend on. `customer` owns this contract — order consumes it as-is
 * instead of picking fields out of Customer itself.
 *
 * Why this exists: Order.customerSnapshot is a point-in-time copy taken when
 * the order was placed, not a live reference — segment is deliberately
 * excluded because it drifts over time (a customer can be reclassified
 * new -> returning -> vip) and a past order should not silently relabel
 * itself when that happens. Only identity fields that describe who bought
 * the order, not their current standing, belong here.
 */
export type CustomerOrderSnapshot = Pick<Customer, "name" | "email">;
