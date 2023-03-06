import z from "zod"

// ===============================
// Simple types and constrained types related to the OrderTaking domain.
//
// E.g. Single case discriminated unions (aka wrappers), enums, etc
// ===============================

/// Constrained to be 50 chars or less, not null
export const String50 = z.string().max(50).min(1)

/// An email address
export const EmailAddress = z.string().email()

/// A zip code
export const ZipCode = z.string()

/// An Id for Orders. Constrained to be a non-empty string < 10 chars
export const OrderId = z.string()

/// An Id for OrderLines. Constrained to be a non-empty string < 10 chars
export const OrderLineId = z.string()

/// The codes for Widgets start with a "W" and then four digits
export const WidgetCode = z.string().regex(/^W\d{4}$/)

/// The codes for Gizmos start with a "G" and then three digits.
export const GizmoCode = z.string().regex(/^G\d{3}$/)

/// A ProductCode is either a Widget or a Gizmo
export const ProductCode = z.union([ WidgetCode, GizmoCode])
export type ProductCode = z.infer<typeof ProductCode>

/// Constrained to be a integer between 1 and 1000
export const UnitQuantity = z.number().int().min(1).max(1000)

/// Constrained to be a decimal between 0.05 and 100.00
export const KilogramQuantity = z.number().min(0.05).max(100.00)

/// A Quantity is either a Unit or a Kilogram
export const OrderQuantity = z.union([ UnitQuantity, KilogramQuantity ])

/// Constrained to be a decimal between 0.0 and 1000.00
export const Price = z.number().min(0.0).max(1000.00)
export type Price = z.infer<typeof Price>

/// Constrained to be a decimal between 0.0 and 10000.00
export const BillingAmount = z.number().min(0.0).max(10000.00)

/// Represents a PDF attachment
export const PdfAttachment = z.object({
    name : z.string(),
    bytes: z.instanceof(ArrayBuffer),
})
