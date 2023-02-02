import z from 'zod'
import { match } from 'ts-pattern'


// Working with typescript types
const Person = z.object({
    First: z.string(),
    Last: z.string(),
})
type Person = z.infer<typeof Person>

const aPerson = Person.parse({
    First: "Alex",
    Last: "Adams",
})

const { First: first, Last: last} = aPerson

const UnitQuantity = z.object({ type: z.literal("unit"), value: z.number().int().positive() })
const KilogramQuantity = z.object({ type: z.literal("kilogram"), value: z.number().positive() })
const OrderQuantity = z.discriminatedUnion("type", [UnitQuantity, KilogramQuantity])
type OrderQuantity = z.infer<typeof OrderQuantity>

const anOrderQtyInUnits = OrderQuantity.parse({ type: "unit", value: 10 })
const anOrderQtyInKg = OrderQuantity.parse({ type: "kilogram", value: 2.5 })

const printQuantity = (aOrderQty: OrderQuantity) =>
    match(aOrderQty)
        .with({ type: "unit" }, uQty => console.log(`${uQty.value} units`))
        .with({ type: "kilogram" }, kgQty => console.log(`${kgQty.value} kg`))
        .exhaustive()

printQuantity(anOrderQtyInUnits) // "10 units"
printQuantity(anOrderQtyInKg) // "2.5 kg"

// Building a Domain Model by Composing Types
const CheckNumber = z.number().int()
const CardNumber = z.string()

const CardType = z.union([z.literal("Visa"), z.literal("Mastercard")])
const CreditCardInfo = z.object({
    cardType: CardType,
    cardNumber: CardNumber,
})

const PaymentMethod = z.discriminatedUnion("method", [
    z.object({ method: z.literal("Cash")}),
    z.object({ method: z.literal("Check"), value: CheckNumber}),
    z.object({ method: z.literal("Card"), value: CreditCardInfo}),
])

const PaymentAmount = z.number()
const Currency = z.union([z.literal("EUR"), z.literal("USD")])

const Payment = z.object({
    amount: PaymentAmount,
    currency: Currency,
    method: PaymentMethod
})
type Payment = z.infer<typeof Payment>

const UnpaidInvoice = z.object({
    invoiceId: z.string().uuid()
})
type UnpaidInvoice = z.infer<typeof UnpaidInvoice>
const PaidInvoice = z.object({
    invoiceId: z.string().uuid(),
    payment: Payment
})
type PaidInvoice = z.infer<typeof PaidInvoice>

type PayInvoice = (unpaidInvoice: UnpaidInvoice, payment: Payment) => PaidInvoic

// Modeling Optional Values, Errors, and Collections
const PersonalName = z.object({
    firstName: z.string(),
    middleInitial: z.string().optional(),
    lastName: z.string()
})


