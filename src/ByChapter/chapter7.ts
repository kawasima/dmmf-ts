import z from "zod"
import { UnvalidatedOrder } from "../OrderTaking/Order.PublicTypes"

const Data = z.record(z.any())
type Data = z.infer<typeof Data>

const Command = <T extends z.ZodType<Data>>(schema: T) =>
    z.object({
        data: schema,
        timestamp: z.date(),
        userId: z.string(),
    })
const PlaceOrder = Command(UnvalidatedOrder)
type PlaceOrder = z.infer<typeof PlaceOrder>