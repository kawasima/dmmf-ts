import z from "zod"

/*
 * The example of total functions.
 * see https://scrapbox.io/kawasima/Totality
 */

export namespace PartialFunction {
    type Divide = (a: number, b: number) => number

    export const divide: Divide = (a, b) => {
        if (b === 0) {
            throw new Error(`denominator must not be zero`)
        }
        return a/b
    }
}

export namespace TotalityByOption {
    type Divide = (a: number, b: number) => number | undefined

    export const divide: Divide = (a, b) => {
        if (b !== 0) return a/b
    }
}

export namespace TotalityByNonZero {
    export const NonZeroNumber = z.number().refine(v => v !== 0).brand("NonZeroNumber")    
    type NonZeroNumber = z.infer<typeof NonZeroNumber>

    type Divide = (a:number, b: NonZeroNumber) => number

    export const divide: Divide = (a,b) => a/b    
}
