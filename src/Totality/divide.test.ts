import { ZodError } from "zod";
import {
    PartialFunction as P,
    TotalityByOption as O,
    TotalityByNonZero as N,
} from "./divide";

describe("Partial Function", () => {
    test("6/2 === 3", () =>
        expect(P.divide(6, 2)).toBe(3))
    test("zero divide error", () =>
        expect(() => P.divide(6, 0)).toThrow())
})

describe("Total Function by Optional", () => {
    test("6/2 === 3", () =>
        expect(O.divide(6, 2)).toBe(3))
    test("zero divide error", () => {
        expect(O.divide(6, 0)).toBeUndefined()
    })
})

describe("Partial Function by NonZeroNumber", () => {
    test("6/2 === 3", () =>
        expect(N.divide(6, N.NonZeroNumber.parse(2))).toBe(3))
    //test("zero divide error", () => expect(() => N.divide(6, 0)).toThrow())
    test("parse error by NonZeroNumber", () =>
        expect(() => N.NonZeroNumber.parse(0)).toThrowError(ZodError))
})

