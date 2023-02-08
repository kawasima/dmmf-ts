import z from "zod"
import * as E from "fp-ts/Either"

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

const Change = z.array(Cash)
type Change = z.infer<typeof Change>

type Deposit = (charge: Charge, cash: Cash) => E.Either<Change, Charge>
type Refund = (charge: Charge) => Change

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

