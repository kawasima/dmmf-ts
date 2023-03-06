import { NotTotality as N, Money } from "./person"

test("未成年には支払われる", () => {
    const person = N.Person.parse({
        lastName: "Test",
        firstName: "Person",
        postalCd: "1234567",
        prefectureCd: "13",
        address1: "Suginami-ku",
        birthday: new Date(2010, 0, 1),
        guardians: [],
    })
    N.payAllowance(person, Money.parse(10000))
})

test("成年の場合はエラー", () => {
    const person = N.Person.parse({
        lastName: "Test",
        firstName: "Person",
        postalCd: "1234567",
        prefectureCd: "13",
        address1: "Suginami-ku",
        birthday: new Date(1910, 0, 1),
        guardians: [],
    })
    expect(() => N.payAllowance(person, Money.parse(10000))).toThrowError()
})
