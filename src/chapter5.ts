import z from 'zod'
import { match } from 'ts-pattern'

// 
// Modeling Simple Values
//
const CustomerId = z.number().int().positive().brand<"CustomerId">()
type CustomerId = z.infer<typeof CustomerId>

const WidgetCode = z.string()
type WidgetCode = z.infer<typeof WidgetCode>

const UnitQuantity = z.number().int().positive()
type UnitQuantity = z.infer<typeof UnitQuantity>

const KilogramQuantity = z.number().positive()
type KilogramQuantity = z.infer<typeof KilogramQuantity>

const OrderId = z.number().int().positive().brand<"OrderId">()
type OrderId = z.infer<typeof OrderId>

const customerId = CustomerId.parse(42)
const orderId = OrderId.parse(42)

// zodのbrandでタグ付けしておくと、型エラーにできる
console.log(customerId === orderId)

// 引数の取り違えもエラーになる
const processCustomerId = (id: CustomerId) => {}
processCustomerId(orderId)


// 
// Modeling Complex Data
//

// まだ分かっていない型は、Undefinedにしておく
const Undefined = z.undefined()
const CustomerInfo = Undefined
const ShippingAddress = Undefined
const BillingAddress = Undefined
const OrderLine = Undefined
const BillingAmount = Undefined

const Order = z.object({
    customerInfo: CustomerInfo,
    shippingAddress: ShippingAddress,
    billingAddress: BillingAddress,
    orderLines: z.array(OrderLine),
    amountToBill: BillingAmount
})

// Choice型のモデリング
/*
    data ProductCode =
        WidgetCode
        OR GizmoCode

    data OrderQuantity =
        UnitQuantity
        OR KilogramQuantity
*/
const ProductCode = z.union([
    z.literal("Widget"),
    z.literal("Gizmo"),
])

const OrderQuantity = z.union([
    z.literal("Unit"),
    z.literal("Kilogram"),
])

//
// Modeling Workflows with Functions
//
const UnvalidatedOrder = Undefined
type UnvalidatedOrder = z.infer<typeof UnvalidatedOrder>
const ValidatedOrder = Undefined
type ValidatedOrder = z.infer<typeof ValidatedOrder>
type ValidateOrder = (unvalidatedOrder: UnvalidatedOrder) => ValidateOrder

const AcknowledgmentSent = Undefined
const OrderPlaced = Undefined
const BillableOrderPlaced = Undefined
const PlaceOrderEvents = z.object({
    acknowledgementSent: AcknowledgmentSent,
    orderPlaced: OrderPlaced,
    billableOrderPlaced: BillableOrderPlaced,
})
type PlaceOrderEvents = z.infer<typeof PlaceOrderEvents>

// 注文受付全体を表すFunction
type PlaceOrder = (unvalidatedValidatedOrder: UnvalidatedOrder) => PlaceOrderEvents

/*
​ 	workflow "Categorize Inbound Mail" =
​ 	    input: Envelope contents
​ 	    output:
​ 	        QuoteForm (put on appropriate pile)
​ 	        OR OrderForm (put on appropriate pile)
​ 	        OR ...
*/
const EnvelopeContents = z.string()
type EnvelopeContents = z.infer<typeof EnvelopeContents>
const QuoteForm = Undefined
const OrderForm = Undefined
type OrderForm = z.infer<typeof OrderForm>
const CategorizedMail = z.union([
    QuoteForm,
    OrderForm,
])
type CategorizedMail = z.infer<typeof CategorizedMail>
type CategorizeInboundMail = (envelopContents: EnvelopeContents) => CategorizeInboundMail

/*
​ 	"Calculate Prices" =
​ 	    input: OrderForm, ProductCatalog
​ 	    output: PricedOrder
*/
const ProductCatalog = Undefined
type ProductCatalog = z.infer<typeof ProductCatalog>
const PricedOrder = Undefined
type PricedOrder = z.infer<typeof PricedOrder>
type CalculatePrices = (orderForm: OrderForm, productCatalog: ProductCatalog) =>
    PricedOrder

