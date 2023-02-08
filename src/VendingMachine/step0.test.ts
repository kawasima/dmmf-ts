import { Charge, Cash, deposit, refund } from "./step0"
import { pipe } from "fp-ts/lib/function" 

const depositChainable = (Cash: Cash) => (charge: Charge) => deposit(charge, Cash)

test("お金を投入していなければ、返金もされない", () => {
    const charge = Charge.parse([])
    expect(refund(charge)).toEqual([])
})

test("任意のお金を投入したら、その分だけ返ってくる", () => {

    const charge = pipe(Charge.parse([]),
        depositChainable(Cash.parse(10)),
        depositChainable(Cash.parse(100)))
    
    expect(charge).toEqual(expect.arrayContaining([10, 100]))
})


