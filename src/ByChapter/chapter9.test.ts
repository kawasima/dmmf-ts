import { ZodError } from "zod"
import { ImplementingTheValidationStep as I } from "./chapter9"
import { UnvalidatedOrder } from "../OrderTaking/Order.PublicTypes"
import { CheckProductCodeExists, ValidatedOrder } from "../OrderTaking/PlaceOrder.Implementation"

test("Orderのバリデーション正常", () => {
    // dependenciesのスタブ (どちらも正常系)
    const checkAddressExists: I.CheckAddressExists = addr => addr
    const checkProductCodeExists: CheckProductCodeExists = productCode => true

    const validateOrder = I.validateOrder(checkProductCodeExists, checkAddressExists);
    const unvalidatedOrder: UnvalidatedOrder = {
        orderId: "1234",
        customerInfo: {
            firstName: "Test",
            lastName: "Family",
            emailAddress: "kawasima@example.com",
        },
        billingAddress: {
            zipCode: "1234567",
            city: "Tokyo",
            addressLine1: "Suginami-ku",

        },
        shippingAddress: {
            zipCode: "1234567",
            city: "Tokyo",
            addressLine1: "Suginami-ku",
        },
        lines: [{
            orderLineId: "123",
            productCode: "W1234",
            quantity: 1,
        }]
    }
    const validatedOrder: ValidatedOrder = validateOrder(unvalidatedOrder)
    expect(validatedOrder.orderId).toBe("1234")
    expect(validatedOrder.lines.length).toBe(1)
})

test("Orderのバリデーション_ProductCodeが存在しない", () => {
    // dependenciesのスタブ (ProductCodeが存在しない)
    const checkAddressExists: I.CheckAddressExists = addr => addr
    const checkProductCodeExists: CheckProductCodeExists = productCode => false

    const validateOrder = I.validateOrder(checkProductCodeExists, checkAddressExists);
    const unvalidatedOrder: UnvalidatedOrder = {
        orderId: "1234",
        customerInfo: {
            firstName: "Test",
            lastName: "Family",
            emailAddress: "kawasima@example.com",
        },
        billingAddress: {
            zipCode: "1234567",
            city: "Tokyo",
            addressLine1: "Suginami-ku",

        },
        shippingAddress: {
            zipCode: "1234567",
            city: "Tokyo",
            addressLine1: "Suginami-ku",
        },
        lines: [{
            orderLineId: "123",
            productCode: "W1234",
            quantity: 1,
        }]
    }
    expect(() => validateOrder(unvalidatedOrder)).toThrowError(/Invalid:/)
})

test("Orderのバリデーション_ProductCodeのコード体系がおかしい", () => {
    // dependenciesのスタブ
    const checkAddressExists: I.CheckAddressExists = addr => addr
    const checkProductCodeExists: CheckProductCodeExists = productCode => true

    const validateOrder = I.validateOrder(checkProductCodeExists, checkAddressExists);
    const unvalidatedOrder: UnvalidatedOrder = {
        orderId: "1234",
        customerInfo: {
            firstName: "Test",
            lastName: "Family",
            emailAddress: "kawasima@example.com",
        },
        billingAddress: {
            zipCode: "1234567",
            city: "Tokyo",
            addressLine1: "Suginami-ku",

        },
        shippingAddress: {
            zipCode: "1234567",
            city: "Tokyo",
            addressLine1: "Suginami-ku",
        },
        lines: [{
            orderLineId: "123",
            productCode: "X1234",
            quantity: 1,
        }]
    }
    expect(() => validateOrder(unvalidatedOrder)).toThrowError(ZodError)
})
