import z from "zod";
import { match } from "ts-pattern"

namespace NoDomainModel {
    type Contact = {
        firstName: string;
        middleInitial: string;
        lastName: string;

        emailAddress: string;
        isEmailVerified: boolean;
    }
}

namespace DomainModel {
    type Contact = {
        name: PersonalName;
        email: EmailContactInfo;
    }

    type PersonalName = {
        firstName: String50;
        middleInitial: String50 | undefined;
        lastName: String50;
    }

    type String50 = string;
    type CreateString50 = (s:string) => String50
    const createString50: CreateString50 = s => {
        if (s !== null && s.length !== 0 && s.length <= 50) {
            return s;
        } else {
            return "???";
        }
    }

    type EmailContactInfo = {
        emailAddress: EmailAddress;
        isEmailVerified: boolean;
    }
    type EmailAddress = string;
}

namespace DomainModelWithZod {
    const String50 = z.string().min(1).max(50).brand("String50")
    type String50 = z.infer<typeof String50>
    const String1 = z.string().min(1).max(1).brand("String1")
    type String1 = z.infer<typeof String1>
    const EmailAddress = z.string().email()
    type EmailAddress = z.infer<typeof EmailAddress>
    const VerifiedEmail = EmailAddress.brand("VerifiedEmail")
    type VerifiedEmail = z.infer<typeof VerifiedEmail>

    const PersonalName = z.object({
        firstName: String50,
        middleInitial: String1.optional(),
        lastName: String50,
    })
    const EmailContact = z.discriminatedUnion("type", [
        z.object({type: z.literal("Unverified"), value: EmailAddress }),
        z.object({type: z.literal("Verified"), value: VerifiedEmail }),
    ])
    type EmailContact = z.infer<typeof EmailContact>

    type VerificationHash = undefined

    type VerificationService = (
        emailAddress: EmailAddress,
        hash: VerificationHash,
    ) => VerifiedEmail | undefined

    const Contact = z.object({
        name: PersonalName,
        emailContact: EmailContact,
    })

    type SendPasswordReset = (email: VerifiedEmail) => void
    const sendMail = (email: string): void => {} // Stub

    const sendPasswordReset: SendPasswordReset = emailAddress => {
        sendMail(emailAddress)
    }

}