import z from "zod"
import * as E from "fp-ts/Either"

export const Juice = z.object({
    name: z.string(),
    price: z.number().int().positive(),
})
export type Juice = z.infer<typeof Juice>

export const AcceptableCash = z.union([
    z.literal(10),
    z.literal(50),
    z.literal(100),
    z.literal(500),
    z.literal(1000),
])

export const Cash = AcceptableCash.or(z.union([
    z.literal(1),
    z.literal(5),
    z.literal(5000),
    z.literal(10000),
])).brand<"Cash">()

export type Cash = z.infer<typeof Cash>

export const Charge = z.array(Cash)
export type Charge = z.infer<typeof Charge>

export const StockItem = z.object({
    juice: Juice,
    quantity: z.number().int().positive()    
})
export type StockItem = z.infer<typeof StockItem>

export const Cashbox = z.record(AcceptableCash, z.number().int().positive())
export const VendingMachine = z.object({
    stock: z.array(StockItem),
    cashbox: Cashbox,
})
export type VendingMachine = z.infer<typeof VendingMachine>

const Change = z.array(Cash)
type Change = z.infer<typeof Change>

type Deposit = (charge: Charge, coin: Cash) => E.Either<Change, Charge>
type Refund = (charge: Charge) => Change
type GetStock = (vm : VendingMachine) => StockItem[]

// ---- Implementation ---
export const deposit: Deposit = (charge, cash) => {
    const res = AcceptableCash.safeParse(cash)
    return res.success ?
        E.right(Charge.parse([...charge, res.data]))
        :
        E.left(Change.parse([cash]))
}

export const refund: Refund = (charge) =>
    Change.parse(charge)

export const getStock: GetStock = (vm) => vm.stock
export const createVendingMachine = (): VendingMachine =>
    VendingMachine.parse({
        cashbox: {},
        stock: [
            { juice: { name: "コーラ", price: 120 }, quantity: 5 }
        ]
    })