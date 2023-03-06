import z from "zod"

export const Relationship = z.union([
    z.literal("Father"),
    z.literal("Mother"),
])
export const Money = z.number().positive()
export type Money = z.infer<typeof Money>

const sendAllowance = (guardian: {}, amount: Money) => {}

export const calcAge = (birthday: Date): number => {
    const today = new Date()
    let age = today.getFullYear() - birthday.getFullYear()
    const m = today.getMonth() - birthday.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    return age
}

export namespace NotTotality {
    export const Person = z.object({
        lastName: z.string(),
        firstName: z.string(),
        postalCd: z.string(),
        prefectureCd: z.string(),
        address1: z.string(),
        address2: z.string().optional(),
        birthday: z.date(),
        guardians: z.array(z.object({
            lastName: z.string(),
            firstName: z.string(),
            relationship: Relationship,
        })),
    })
    export type Person = z.infer<typeof Person>

    export const payAllowance = (person: Person, amount: Money) => {
        if (calcAge(person.birthday) >= 18) {
            throw new Error(`成年には子供手当は支払いません`)
        }
        sendAllowance(person.guardians[0], amount)
    }
}

namespace Totality1 {
    const OrveragePerson = z.object({
        lastName: z.string(),
        firstName: z.string(),
        postalCd: z.string(),
        prefectureCd: z.string(),
        address1: z.string(),
        address2: z.string().optional(),
        birthday: z.date(),
    })

    const UnderagePerson = z.object({
        lastName: z.string(),
        firstName: z.string(),
        postalCd: z.string(),
        prefectureCd: z.string(),
        address1: z.string(),
        address2: z.string(),
        birthday: z.date().refine(v => calcAge(v) < 18),
        guardians: z.object({
            lastName: z.string(),
            firstName: z.string(),
            relationship: Relationship,
        }).array().nonempty(),
    })
    type UnderagePerson = z.infer<typeof UnderagePerson>

    const payAllowance = (person: UnderagePerson, amount: Money) => {
        sendAllowance(person.guardians[0], amount)
    }
}

namespace Totality2 {
    const OrveragePerson = z.object({
        lastName: z.string(),
        firstName: z.string(),
        postalCd: z.string(),
        prefectureCd: z.string(),
        address1: z.string(),
        address2: z.string().optional(),
        birthday: z.date(),
    })

    const UnderagePerson = z.intersection(OrveragePerson, z.object({
        guardians: z.object({
            lastName: z.string(),
            firstName: z.string(),
            relationship: Relationship,
        }).array().nonempty(),
    }))

    type UnderagePerson = z.infer<typeof UnderagePerson>

    const payAllowance = (person: UnderagePerson, amount: Money) => {
        sendAllowance(person.guardians[0], amount)
    }
}

namespace Totality3 {
    const PersonalName = z.object({
        lastName: z.string().min(1).max(50),
        firstName: z.string().min(1).max(50),
    })
    const PrefectureCode = z.string().regex(/\d{2}/)
    const PostalCode = z.string().min(7).max(7)
    const PostalAddress = z.object({
        postalCode: PostalCode,
        prefectureCode: PrefectureCode,
        address1: z.string().min(1).max(100),
        address2: z.string().min(1).max(100),
    })
    const Birthday = z.date()

    const Guardian = z.object({
        name: PersonalName,
        relationship: Relationship,
    })

    const OveragePerson = z.object({
        name: PersonalName,
        address: PostalAddress,
        birthday: Birthday,        
    })    
    type OveragePerson = z.infer<typeof OveragePerson>

    const UnderagePerson = z.object({
        name: PersonalName,
        address: PostalAddress,
        birthday: Birthday,
        guardians: Guardian.array().nonempty(),
    })
    type UnderagePerson = z.infer<typeof UnderagePerson>

    const payAllowance = (person: UnderagePerson, amount: Money) => {
        sendAllowance(person.guardians[0], amount)
    }    
}


