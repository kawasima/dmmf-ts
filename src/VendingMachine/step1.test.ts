import { Charge, Cash, deposit, refund } from "./step1"
import { pipe } from "fp-ts/lib/function" 
import * as E from "fp-ts/Either"
import { fail } from "assert"

test("5円は受け付けない", () => {
    const charge = Charge.parse([])
    const change = deposit(charge, Cash.parse(5))
    expect(E.isLeft(change)).toBe(true)
    pipe(change,
        E.match(
            c => expect(c).toEqual(expect.arrayContaining([5])),
            c => fail()))
})

test("10円は受け付ける", () => {
    const charge = Charge.parse([])
    const change = deposit(charge, Cash.parse(10))
    expect(E.isLeft(change)).toBe(false)
    pipe(change,
        E.match(
            c => fail(),
            c => expect(c).toEqual(expect.arrayContaining([10]))))
})

