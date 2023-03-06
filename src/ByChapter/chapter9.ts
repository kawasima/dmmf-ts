import z from "zod"
import { Address, CustomerInfo } from "../OrderTaking/Common.CompoundTypes"
import { OrderId, ProductCode } from "../OrderTaking/Common.SimpleTypes"
import { UnvalidatedAddress, UnvalidatedCustomerInfo, UnvalidatedOrder, UnvalidatedOrderLine } from "../OrderTaking/Order.PublicTypes"
import { CheckedAddress, CheckProductCodeExists, ValidatedOrder, ValidatedOrderLine } from "../OrderTaking/PlaceOrder.Implementation"
import { pipe } from "fp-ts/lib/function"

// -------------------------
// Working with Simple Types
// -------------------------

/*
 * 単純型の実装はZodでparseすることに他ならない
 */

namespace WorkingWithSimpleTypes {
    const OrderId = z.string().min(1).max(50).brand("OrderId")
    type OrderId = z.infer<typeof OrderId>
}

// ------------------------------------------------
// 関数型を使って実装をナビゲートする
// ------------------------------------------------

namespace UsingFunctionTypesToGuideTheImplementation {
    const Param1 = z.unknown()
    type Param1 = z.infer<typeof Param1>
    const Param2 = z.unknown()
    type Param2 = z.infer<typeof Param2>
    const Result = z.unknown()
    type Result = z.infer<typeof Result>

    // 関数が特定の関数型を実装していることを明示するために、型定義を先に作る
    type MyFunctionSignature = (p1 :Param1, p2: Param2) => Result

    const myFunc: MyFunctionSignature = (p1, p2) =>
        // ...
        Result.parse(1)

}

// ------------------------------------------------
// バリデーションステップを実装する
// ------------------------------------------------
export namespace ImplementingTheValidationStep {
    export type CheckAddressExists = (addr: UnvalidatedAddress) => CheckedAddress
    type ValidateOrder = ( 
        checkProductCodeExists: CheckProductCodeExists, // dependences
        checkAddressExists: CheckAddressExists, // dependences
    ) => (
        unvalidatedOrder: UnvalidatedOrder // input
    ) => ValidatedOrder // Output

    /* DMMFのF#のコードは部分適用がネイティブなので、引数をグルーピングすることは
     * していないが、TypeScriptの場合は、依存関数を受け取ってPure関数を返す、
     * すなわち関数の関数として実装しておくと、扱いやすい。
     */

    const toAddress = (checkAddressExists: CheckAddressExists, unvalidatedAddress: UnvalidatedAddress):CheckedAddress =>
        checkAddressExists(unvalidatedAddress)
    
    const toCustomerInfo = (customer: UnvalidatedCustomerInfo): CustomerInfo =>
        CustomerInfo.parse({
            name: {
                firstName: customer.firstName,
                lastName: customer.lastName,
            },
            emailAddress: customer.emailAddress,
        })
    
    
    const predicateToPassthru = <A>(
        errMsg: string,
        f: (a: A) => boolean,
        x: A
    ): A => {
        if (f(x)) {
            return x
        } else {
            throw new Error(errMsg)
        }
    }

    const toProductCode = (
        checkProductCodeExists: CheckProductCodeExists,
    ) => (
        productCode: string,
    ): ProductCode => {
        const checkProduct = (productCode: ProductCode) => {
            const errorMsg = `Invalid: ${productCode}`
            return predicateToPassthru(errorMsg, checkProductCodeExists, productCode)
        }
        return pipe(productCode,
            ProductCode.parse,
            checkProduct,
        )
    }

    const toValidatedOrderLine = (
        checkProductCodeExists: CheckProductCodeExists,
    ) => (
        unvalidatedOrderLine: UnvalidatedOrderLine
    ): ValidatedOrderLine => ValidatedOrderLine.parse({
        orderLineId: unvalidatedOrderLine.orderLineId,
        productCode: toProductCode(checkProductCodeExists)(unvalidatedOrderLine.productCode),
        quantity: unvalidatedOrderLine.quantity,
    })

    export const validateOrder: ValidateOrder = (checkProductCodeExists, checkAddressExists) =>
        (unvalidatedOrder) =>
            ValidatedOrder.parse({
                orderId: unvalidatedOrder.orderId,
                customerInfo: toCustomerInfo(unvalidatedOrder.customerInfo),
                shippingAddress: toAddress(checkAddressExists, unvalidatedOrder.shippingAddress),
                billingAddress: toAddress(checkAddressExists, unvalidatedOrder.billingAddress),
                lines: unvalidatedOrder.lines.map(toValidatedOrderLine(checkProductCodeExists)),
            })
}