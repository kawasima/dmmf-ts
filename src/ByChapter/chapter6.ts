import z from "zod"
import { match } from "ts-pattern"

//
// The integrity of Simple Value
//

/*
​ 	​type​ WidgetCode = WidgetCode ​of​ ​string​   ​// starting with "W" then 4 digits​
​ 	​type​ UnitQuantity = UnitQuantity ​of​ ​int​  ​// between 1 and 1000​
​ 	​type​ KilogramQuantity = KilogramQuantity ​of​ decimal ​// between 0.05 and 100.00
*/
const UnitQuantity = z.number().int().min(1).max(1000)
const result = UnitQuantity.safeParse(0)
match(result)
    .with({success: true}, ({ data }) => console.log(`Success. value is ${data}`))
    .with({success:false}, ({ error }) => console.log(`Failure, Message is ${error.message}`))
    .exhaustive()

