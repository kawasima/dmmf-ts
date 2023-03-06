import { match } from "ts-pattern"
import z from "zod"
import { flow } from "fp-ts/function"

const plus3 = (x: number): number => x + 3
const times2 = (x: number): number => x * 2
const square = (x: number): number => x * x
const addThree = plus3

const listOfFunctions: ((x: number) => number)[]
    = [ addThree, times2, square ]

for (let fn of listOfFunctions) {
    const result = fn(100)
    console.log(`If 100 is the input, the output is ${result}`)
}

// Result =>​
// If 100 is the input, the output is 103
// If 100 is the input, the output is 200
// If 100 is the input, the output is 10000

// ------------------
// Functions as Input
// ------------------
const evalWith5ThenAdd2 = (fn: (f:number) => number): number => fn(5) + 2

const add1 = (x: number): number => x + 1
evalWith5ThenAdd2(add1) // fn(5) + 2 becomes add1(5) + 2
// Output 8

evalWith5ThenAdd2(square) // fn(5) + 2 becomes square(5) + 2
// Output 27

// ------------------
// Functions as Output
// ------------------
const add2 = (x: number): number => x + 2
const add3 = (x: number): number => x + 3

const adderGenerator = (numberToAdd: number) => (x: number) => numberToAdd + x


adderGenerator(1)(2)
adderGenerator(100)(2)

// ----------------
// Total Functions
// ----------------
const twelveDivideBy = (n: number) =>
    match(n)
        .with(6, () => 2)
        .with(5, () => 2)
        .with(4, () => 3)
        .with(3, () => 4)
        .with(2, () => 6)
        .with(1, () => 12)
        .with(0, () => NaN)

const NonZeroInteger = z.number().int().refine(v => v !== 0)
type NonZeroInteger = z.infer<typeof NonZeroInteger>
const twelveDivideByNonZero = (n: NonZeroInteger): number;

// ----------------
// Composition
// ----------------

namespace Composition {
    const add1 = (x: number): number => x + 1
    const square = (x: number): number => x * x
    const add1ThenSquare = flow(add1, square)
    add1ThenSquare(5) // result is 36

    // ある関数の戻り値の型と、別の関数の引数の型が一致すれば合成できる
    const isEven = (x: number): boolean => x%2 == 0
    const printBool = (x: boolean) => `value is ${x}`

    const isEvenThenPrint = flow(isEven, printBool)
    isEvenThenPrint(2) // result is "value is true"
}
