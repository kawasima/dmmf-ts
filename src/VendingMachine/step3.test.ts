import { createVendingMachine, getStock, VendingMachine } from "./step2"

test("初期状態はコーラ5本", () => {
    const vendingMachine = createVendingMachine()
    const stockItems = getStock(vendingMachine)
    expect(stockItems).toHaveLength(1)
    expect(stockItems[0].juice.name).toBe("コーラ")
})