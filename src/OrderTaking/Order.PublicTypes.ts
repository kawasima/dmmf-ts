import { Either } from "fp-ts/lib/Either";
import z from "zod";
import { Address, CustomerInfo } from "./Common.CompoundTypes";
import { BillingAmount, EmailAddress, OrderId, OrderLineId, OrderQuantity, Price, ProductCode } from "./Common.SimpleTypes"

// ------------------------------------
// inputs to the workflow
export const UnvalidatedCustomerInfo = z.object({
    firstName: z.string(),
    lastName: z.string(),
    emailAddress: z.string(),
})
export type UnvalidatedCustomerInfo = z.infer<typeof UnvalidatedCustomerInfo>

export const UnvalidatedAddress = z.object({
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    addressLine3: z.string().optional(),
    addressLine4: z.string().optional(),
    city: z.string(),
    zipCode: z.string(),
})
export type UnvalidatedAddress = z.infer<typeof UnvalidatedAddress>

export const UnvalidatedOrderLine = z.object({
    orderLineId: z.string(),
    productCode: z.string(),
    quantity: z.number(),
})
export type UnvalidatedOrderLine = z.infer<typeof UnvalidatedOrderLine>

export const UnvalidatedOrder = z.object({
    orderId: z.string(),
    customerInfo: UnvalidatedCustomerInfo,
    shippingAddress: UnvalidatedAddress,
    billingAddress: UnvalidatedAddress,
    lines: z.array(UnvalidatedOrderLine)
})
export type UnvalidatedOrder = z.infer<typeof UnvalidatedOrder>

// ------------------------------------
// outputs from the workflow (success case)

/// Event will be created if the Acknowledgment was successfully posted
export const OrderAcknowledgementSend = z.object({
    orderId: OrderId,
    emailAddress: EmailAddress,
})
export type OrderAcknowledgmentSent = z.infer<typeof OrderAcknowledgementSend>

// priced state
export const PricedOrderLine = z.object({
    orderLineId: OrderLineId,
    productCode: ProductCode,
    quantity: OrderQuantity,
    linePrice: Price,
})

export const PricedOrder = z.object({
    orderId: OrderId,
    customerInfo: CustomerInfo,
    shippingAddress: Address,
    billingAddress: Address,
    amountToBill: BillingAmount,
    lines: z.array(PricedOrderLine),
})
export type PricedOrder = z.infer<typeof PricedOrder>

/// Event to send to shipping context
export const OrderPlaced = PricedOrder

/// Event to send to billing context
/// Will only be created if the AmountToBill is not zero
export const BillableOrderPlaced = z.object({
    orderId: OrderId,
    billingAddress: Address,
    amountToBill: BillingAmount,
})
export type BillableOrderPlaced = z.infer<typeof BillableOrderPlaced>

/// The possible events resulting from the PlaceOrder workflow
/// Not all events will occur, depending on the logic of the workflow
export const PlaceOrderEvent = z.union([ OrderPlaced, BillableOrderPlaced, OrderAcknowledgementSend ])
export type PlaceOrderEvent = z.infer<typeof PlaceOrderEvent>

// ------------------------------------
// error outputs


/// All the things that can go wrong in this workflow
export const ValidationError = z.string()

export const PricingError = z.string()

export const ServiceInfo = z.object({
    name: z.string(),
    endpoint: z.instanceof(URL),
})

export const RemoteServiceError = z.object({
    service : ServiceInfo,
    exception : z.instanceof(Error),
})

export const PlaceOrderError = z.union([
    ValidationError,
    PricingError,
    RemoteServiceError,
])
export type PlaceOrderError = z.infer<typeof PlaceOrderError>

// ------------------------------------
// the workflow itself

export type PlaceOrder = (unvalidatedOrder: UnvalidatedOrder) => 
    Either<PlaceOrderError, PlaceOrderEvent[]>


