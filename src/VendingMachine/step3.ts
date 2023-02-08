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
    charge: Charge,
})
export type VendingMachine = z.infer<typeof VendingMachine>

const Change = z.array(Cash)
type Change = z.infer<typeof Change>

type Deposit = (vm: VendingMachine, coin: Cash) => E.Either<Change, VendingMachine>
type Refund = (vm: VendingMachine) => [VendingMachine, Change]
type GetStock = (vm: VendingMachine) => StockItem[]
type CanBuy = (vm: VendingMachine) => boolean
type Buy = (vm: VendingMachine) => E.Either<VendingMachine, [VendingMachine, Juice]>

// ---- Implementation ---
export const deposit: Deposit = (vm, cash) => {
    const res = AcceptableCash.safeParse(cash)
    return res.success ?
        E.right(VendingMachine.parse({
            ...vm,
            charge: [...vm.charge, res.data]
        }))
        :
        E.left(Change.parse([cash]))
}

export const refund: Refund = vm => ([
    VendingMachine.parse({ ...vm, charge: []}),
    Change.parse(vm.charge)
])

export const getStock: GetStock = (vm) => vm.stock
export const createVendingMachine = (): VendingMachine =>
    VendingMachine.parse({
        cashbox: {},
        stock: [
            { juice: { name: "コーラ", price: 120 }, quantity: 5 }
        ],
        charge: []
    })

export const canBuy: CanBuy = vm =>
    vm.charge.reduce((prev, cur) => prev+cur, 0) >= 120
    && vm.stock[0].quantity > 0

export const buy: Buy = vm =>
    canBuy(vm) ?
        E.right([
            VendingMachine.parse({
                stock: vm.stock,
                charge: [],
                
            }),
            vm.stock[0].juice
        ])
        :
        E.left(vm)