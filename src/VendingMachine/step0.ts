import z from "zod"

export const Cash = z.union([
    z.literal(10),
    z.literal(50),
    z.literal(100),
    z.literal(500),
    z.literal(1000),
]).brand<"Cash">()
export type Cash = z.infer<typeof Cash>

export const Charge = z.array(Cash)
export type Charge = z.infer<typeof Charge>

const Change = z.array(Cash)
type Change = z.infer<typeof Change>

type Deposit = (charge: Charge, cash: Cash) => Charge
type Refund = (charge: Charge) => Change

// ---- Implementation ---
export const deposit: Deposit = (charge, cash) => {
    return Charge.parse([ ...charge, cash ])
}

export const refund: Refund = (charge) =>
    Change.parse(charge)

