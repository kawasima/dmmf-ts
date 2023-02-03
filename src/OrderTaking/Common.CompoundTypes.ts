import z from "zod"
import { EmailAddress, String50, ZipCode } from "./Common.SimpleTypes"

// ==================================
// Common compound types used throughout the OrderTaking domain
//
// Includes: customers, addresses, etc.
// Plus common errors.
//
// ==================================


// ==================================
// Customer-related types
// ==================================

export const PersonalName = z.object({
    firstName: String50,
    lastName: String50,
})

export const CustomerInfo = z.object({
    name: PersonalName,
    emailAddress: EmailAddress,
})

// ==================================
// Address-related
// ==================================

export const Address = z.object({
    addressLine1: String50,
    addressLine2: String50.optional(),
    addressLine3: String50.optional(),
    addressLine4: String50.optional(),
    city: String50,
    zipCode: ZipCode,
})

// ==================================
// Product-related types
// ==================================

// Note that the definition of a Product is in a different bounded
// context, and in this context, products are only represented by a ProductCode
// (see the SimpleTypes module).