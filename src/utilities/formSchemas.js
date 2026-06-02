import { z } from "zod";

/**
 * Enterprise Form Validation Schemas using Zod
 */

// Login Form Schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/\d/, "Password must contain at least one number"),
  rememberMe: z.boolean().optional(),
});

// Expense Form Schema
export const expenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title is too long"),
  category: z.string().min(1, "Category is required"),
  vendorName: z.string().trim().optional(),
  totalAmount: z
    .number({ invalid_type_error: "Total Amount must be a number" })
    .positive("Total Amount must be greater than zero"),
  paidAmount: z
    .number({ invalid_type_error: "Paid Amount must be a number" })
    .min(0, "Paid Amount cannot be negative"),
  paymentStatus: z.enum(["Paid", "Unpaid", "Partial"]).default("Unpaid"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  date: z.date({ required_error: "Date is required" }),
  note: z.string().trim().optional(),
  branch: z.string().optional(),
}).refine((data) => data.paidAmount <= data.totalAmount, {
  message: "Paid Amount cannot exceed Total Amount",
  path: ["paidAmount"],
});

// Vendor Payment Schema
export const vendorPaymentSchema = z.object({
  amountPaid: z
    .number({ invalid_type_error: "Amount Paid must be a number" })
    .positive("Amount Paid must be greater than zero"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().trim().optional(),
  paymentDate: z.date({ required_error: "Payment date is required" }),
}).refine((data) => true); // Additional custom validation logic can go here

// Purchases Form Schema
export const purchaseSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  itemName: z.string().trim().min(2, "Item name must be at least 2 characters"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .positive("Quantity must be greater than zero"),
  unitPrice: z
    .number({ invalid_type_error: "Unit price must be a number" })
    .positive("Unit price must be greater than zero"),
  totalAmount: z
    .number({ invalid_type_error: "Total amount must be a number" })
    .positive("Total amount must be greater than zero"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().trim().optional(),
  date: z.date({ required_error: "Date is required" }),
});
