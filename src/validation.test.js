import { loginSchema, expenseSchema } from "./utilities/formSchemas";

describe("Form Validation Schemas", () => {
  describe("Login Schema Validation", () => {
    test("Accepts valid email and password combo", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    test("Rejects invalid emails", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Invalid email address format");
      }
    });

    test("Rejects short passwords", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password must be at least 6 characters long");
      }
    });

    test("Rejects passwords without a number", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "NoNumbersPassword",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password must contain at least one number");
      }
    });
  });

  describe("Expense Schema Validation", () => {
    test("Accepts valid expense payload", () => {
      const result = expenseSchema.safeParse({
        title: "Office internet bill",
        category: "Utility",
        totalAmount: 1500,
        paidAmount: 1000,
        paymentStatus: "Partial",
        paymentMethod: "Cash",
        date: new Date(),
      });
      expect(result.success).toBe(true);
    });

    test("Rejects negative paid amount", () => {
      const result = expenseSchema.safeParse({
        title: "Office rent",
        category: "Rent",
        totalAmount: 10000,
        paidAmount: -500,
        paymentStatus: "Unpaid",
        paymentMethod: "Bank Transfer",
        date: new Date(),
      });
      expect(result.success).toBe(false);
    });

    test("Rejects paid amount exceeding total amount", () => {
      const result = expenseSchema.safeParse({
        title: "Cleaning services",
        category: "Cleaning",
        totalAmount: 1200,
        paidAmount: 1500,
        paymentStatus: "Paid",
        paymentMethod: "Cash",
        date: new Date(),
      });
      expect(result.success).toBe(false);
    });
  });
});
