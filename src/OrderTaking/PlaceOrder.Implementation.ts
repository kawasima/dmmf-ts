import z from "zod"
import { match } from "ts-pattern"
import * as O from "fp-ts/Option"
import { pipe } from 'fp-ts/function'
import { Address, CustomerInfo } from "./Common.CompoundTypes"
import { BillingAmount, EmailAddress, OrderId, OrderLineId, OrderQuantity, Price, ProductCode, String50 } from "./Common.SimpleTypes"
import { BillableOrderPlaced, OrderAcknowledgementSend, OrderAcknowledgmentSent, OrderPlaced, PlaceOrderEvent, PricedOrder, PricedOrderLine, UnvalidatedAddress, UnvalidatedCustomerInfo, UnvalidatedOrder, UnvalidatedOrderLine } from "./Order.PublicTypes"

// ======================================================
// This file contains the implementation for the PlaceOrder workflow
// WITHOUT any effects like Result or Async
//
// This represents the code in chapter 9, "Composing a Pipeline"
//
// There are two parts:
// * the first section contains the (type-only) definitions for each step
// * the second section contains the implementations for each step
//   and the implementation of the overall workflow
// ======================================================


// ------------------------------------
// the workflow itself, without effects
type PlaceOrderWithoutEffects =
    (unvalidatedOrder: UnvalidatedOrder) => PlaceOrderEvent[]

// ======================================================
// Override the SimpleType constructors
// so that they raise exceptions rather than return Results
// ======================================================

// helper to convert Results into exceptions so we can reuse the smart constructors in SimpleTypes.


// ======================================================
// Section 1 : Define each step in the workflow using types
// ======================================================

// ---------------------------
// Validation step
// ---------------------------

// Product validation
export type CheckProductCodeExists =
    (productCode: ProductCode) => boolean

export type CheckedAddress = UnvalidatedAddress

export type CheckAddressExists =
    (unvalidatedAddress: UnvalidatedAddress) => CheckedAddress

// ---------------------------
// Validated Order
// ---------------------------

export const ValidatedOrderLine =  z.object({
    orderLineId: OrderLineId,
    productCode: ProductCode,
    quantity: OrderQuantity,
})
export type ValidatedOrderLine = z.infer<typeof ValidatedOrderLine>

export const ValidatedOrder = z.object({
    orderId: OrderId,
    customerInfo: CustomerInfo,
    shippingAddress: Address,
    billingAddress: Address,
    lines: z.array(ValidatedOrderLine),
})
export type ValidatedOrder = z.infer<typeof ValidatedOrder>

type ValidateOrder = (
    checkProductCodeExists: CheckProductCodeExists,  // dependency
    checkAddressExists: CheckAddressExists
) => (unvalidatedOrder: UnvalidatedOrder) => ValidatedOrder

// ---------------------------
// Pricing step
// ---------------------------

type GetProductPrice = (productCode: ProductCode) => Price

// priced state is defined Domain.WorkflowTypes

type PriceOrder = (
    getProductPrice: GetProductPrice     // dependency
) =>  (validatedOrder: ValidatedOrder) // input
      => PricedOrder    // output

// ---------------------------
// Send OrderAcknowledgment
// ---------------------------

const HtmlString = z.string()
type HtmlString = z.infer<typeof HtmlString>

const OrderAcknowledgment = z.object({
    emailAddress: EmailAddress,
    letter: HtmlString,
})
type OrderAcknowledgment = z.infer<typeof OrderAcknowledgment>

type CreateOrderAcknowledgmentLetter =
    (pricedOrder: PricedOrder) => HtmlString

/// Send the order acknowledgement to the customer
/// Note that this does NOT generate an Result-type error (at least not in this workflow)
/// because on failure we will continue anyway.
/// On success, we will generate a OrderAcknowledgmentSent event,
/// but on failure we won't.
const SendResult = z.union([ z.literal("Sent"), z.literal("NotSent") ])
type SendResult = z.infer<typeof SendResult>

type SendOrderAcknowledgment =
    (orderAcknowledgement: OrderAcknowledgment) => SendResult

type AcknowledgeOrder = (
    createOrderAcknowledgementLetter: CreateOrderAcknowledgmentLetter,  // dependency
    sendOrderAcknowledgement: SendOrderAcknowledgment,      // dependency
) => (priceOrder: PricedOrder) // input
     => O.Option<OrderAcknowledgmentSent> // output

// ---------------------------
// Create events
// ---------------------------

type CreateEvents = (
    pricedOrder: PricedOrder, // input
    orderAcknowledgementSent: O.Option<OrderAcknowledgmentSent> // input (event from previous step)
) => PlaceOrderEvent[]        // output


// ======================================================
// Section 2 : Implementation
// ======================================================

// ---------------------------
// ValidateOrder step
// ---------------------------

const toCustomerInfo = (unvalidatedCustomerInfo: UnvalidatedCustomerInfo): CustomerInfo => {
    const firstName = String50.parse(unvalidatedCustomerInfo.firstName)
    const lastName = String50.parse(unvalidatedCustomerInfo.lastName)
    const emailAddress = EmailAddress.parse(unvalidatedCustomerInfo.emailAddress)

    const customerInfo = {
        name: { firstName, lastName },
        emailAddress: emailAddress,
    }
    return customerInfo
}

const toAddress = (checkAddressExists:CheckAddressExists) => (unvalidatedAddress: UnvalidatedAddress) => {
    // call the remote service
    const checkedAddress = checkAddressExists(unvalidatedAddress)

    return Address.parse({
        addressLine1: checkedAddress.addressLine1,
        addressLine2: checkedAddress.addressLine2,
        addressLine3: checkedAddress.addressLine3,
        addressLine4: checkedAddress.addressLine4,
        city: checkedAddress.city,
        zipCode: checkedAddress.zipCode
    })
}

/// Function adapter to convert a predicate to a passthru
const predicateToPassthru = <T>(errorMsg: string, f: (x:T)=>boolean, x:T) => {
    if (f(x)) {
        return x
    } else {
        throw new Error(errorMsg)
    }
}

/// Helper function for validateOrder
const toProductCode = (checkProductCodeExists:CheckProductCodeExists) => (productCode: ProductCode) => {
    // create a ProductCode -> ProductCode function
    // suitable for using in a pipeline
    const checkProduct = (productCode: ProductCode) => {
        const errorMsg = `Invalid: ${productCode}`
        return predicateToPassthru(errorMsg, checkProductCodeExists, productCode)
    }

    // assemble the pipeline
    checkProduct(productCode)
}

/// Helper function for validateOrder
const toValidatedOrderLine = (checkProductCodeExists: CheckProductCodeExists) => (unvalidatedOrderLine:UnvalidatedOrderLine) => {
    const orderLineId = OrderLineId.parse(unvalidatedOrderLine.productCode)
    const productCode = toProductCode(checkProductCodeExists)(unvalidatedOrderLine.productCode)
    const quantity = OrderQuantity.parse(unvalidatedOrderLine.quantity)

    return ValidatedOrderLine.parse({
        orderLineId, productCode, quantity
    })
}

const validateOrder: ValidateOrder = (checkProductCodeExists: CheckProductCodeExists, checkAddressExists: CheckAddressExists) => (unvalidatedOrder: UnvalidatedOrder) => {
    const orderId = OrderId.parse(unvalidatedOrder.orderId)
    const customerInfo = toCustomerInfo(unvalidatedOrder.customerInfo)
    const shippingAddress = toAddress(checkAddressExists)(unvalidatedOrder.shippingAddress)
    const billingAddress = toAddress(checkAddressExists)(unvalidatedOrder.billingAddress)
    const lines = unvalidatedOrder.lines.map(line =>
        toValidatedOrderLine(checkProductCodeExists)(line))

    return ValidatedOrder.parse({
        orderId, customerInfo, shippingAddress, billingAddress, lines
    })
}

// ---------------------------
// PriceOrder step
// ---------------------------

const toPricedOrderLine = (getProductPrice: GetProductPrice) => (validatedOrderLine:ValidatedOrderLine) => {
    const quantity = OrderQuantity.parse(validatedOrderLine.quantity)
    const price = getProductPrice(validatedOrderLine.productCode)
    const linePrice = price * quantity
    return PricedOrderLine.parse({
        orderLineId: validatedOrderLine.orderLineId,
        productCode: validatedOrderLine.productCode,
        quantity: validatedOrderLine.quantity,
        linePrice,
    })
}


const priceOrder : PriceOrder = (getProductPrice) => (validatedOrder) => {
    const lines = validatedOrder.lines
        .map(line => toPricedOrderLine(getProductPrice)(line))

    const amountToBill = lines
        .map(line => line.linePrice) // get each line price
        .reduce((prev, cur) => prev+cur, 0)  // add them together as a BillingAmount

    return PricedOrder.parse({
        orderId: validatedOrder.orderId,
        customerInfo: validatedOrder.customerInfo,
        shippingAddress: validatedOrder.shippingAddress,
        billingAddress: validatedOrder.billingAddress,
        lines,
        amountToBill,
    })
}

// ---------------------------
// AcknowledgeOrder step
// ---------------------------
const acknowledgeOrder : AcknowledgeOrder = (createAcknowledgmentLetter, sendAcknowledgment) => (pricedOrder: PricedOrder) => {
    const letter = createAcknowledgmentLetter(pricedOrder)
    const acknowledgment = {
        emailAddress: pricedOrder.customerInfo.emailAddress,
        letter
    }

    // if the acknowledgement was successfully sent,
    // return the corresponding event, else return None
    return match(sendAcknowledgment(acknowledgment))
        .with("Sent", () => O.some({
            orderId: pricedOrder.orderId,
            emailAddress: pricedOrder.customerInfo.emailAddress
        }))
        .with("NotSent", () => O.none)
        .exhaustive()
}
// ---------------------------
// Create events
// ---------------------------

const createOrderPlacedEvent = (placedOrder:PricedOrder): PricedOrder =>
    placedOrder

const createBillingEvent = (placedOrder:PricedOrder) : O.Option<BillableOrderPlaced> => {
    const billingAmount = BillingAmount.parse(placedOrder.amountToBill)
    if (billingAmount > 0) {
        return O.some(BillableOrderPlaced.parse({
            orderId: placedOrder.orderId,
            billingAddress: placedOrder.billingAddress,
            amountToBill: placedOrder.amountToBill,
        }))
    } else {
        return O.none
    }
}

/// helper to convert an Option into a List
const listOfOption = <T>(opt: O.Option<T>) =>
    pipe(opt,
        O.match(() => [], x => [x]))

const createEvents: CreateEvents = (pricedOrder, acknowledgmentEventOpt) => {
    const acknowledgmentEvents = pipe(
        acknowledgmentEventOpt,
        O.map(OrderAcknowledgementSend.parse),
        listOfOption)
    const orderPlacedEvents = pipe(
        pricedOrder,
        createOrderPlacedEvent,
        OrderPlaced.parse,
    )
    const billingEvents = pipe(
        pricedOrder,
        createBillingEvent,
        O.map(BillableOrderPlaced.parse),
        listOfOption
    )

    // return all the events
    return [
        acknowledgmentEvents,
        orderPlacedEvents,
        billingEvents,
    ].flat()
}

// ---------------------------
// overall workflow
// ---------------------------

const placeOrder = (
    checkProductExists: CheckProductCodeExists, // dependency
    checkAddressExists: CheckAddressExists, // dependency
    getProductPrice: GetProductPrice,    // dependency
    createOrderAcknowledgmentLetter: CreateOrderAcknowledgmentLetter,  // dependency
    sendOrderAcknowledgment: SendOrderAcknowledgment, // dependency
): PlaceOrderWithoutEffects => (unvalidatedOrder: UnvalidatedOrder) => {      // definition of function
    const validatedOrder = validateOrder(checkProductExists, checkAddressExists)(unvalidatedOrder)
    const pricedOrder = priceOrder(getProductPrice)(validatedOrder)
    const acknowledgementOption = acknowledgeOrder(createOrderAcknowledgmentLetter, sendOrderAcknowledgment)(pricedOrder)
    return createEvents(pricedOrder, acknowledgementOption)
}