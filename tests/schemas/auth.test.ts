import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

describe("loginSchema", () => {
  it("valid dengan email dan password benar", () => {
    const result = loginSchema.safeParse({
      email: "test@email.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("invalid jika email tidak valid", () => {
    const result = loginSchema.safeParse({
      email: "bukan-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("invalid jika password kosong", () => {
    const result = loginSchema.safeParse({
      email: "test@email.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("invalid jika email kosong", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validRegister = {
    name: "John Doe",
    email: "john@email.com",
    password: "Password1",
    confirmPassword: "Password1",
  };

  it("valid dengan data lengkap dan benar", () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  describe("name", () => {
    it("invalid jika kurang dari 2 karakter", () => {
      const result = registerSchema.safeParse({ ...validRegister, name: "A" });
      expect(result.success).toBe(false);
    });

    it("invalid jika lebih dari 50 karakter", () => {
      const result = registerSchema.safeParse({ ...validRegister, name: "a".repeat(51) });
      expect(result.success).toBe(false);
    });

    it("valid dengan nama 2 karakter", () => {
      const result = registerSchema.safeParse({ ...validRegister, name: "Jo" });
      expect(result.success).toBe(true);
    });
  });

  describe("password", () => {
    it("invalid jika kurang dari 8 karakter", () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        password: "Pass1",
        confirmPassword: "Pass1",
      });
      expect(result.success).toBe(false);
    });

    it("invalid jika tidak ada huruf kapital", () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        password: "password1",
        confirmPassword: "password1",
      });
      expect(result.success).toBe(false);
    });

    it("invalid jika tidak ada angka", () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        password: "Passwordnya",
        confirmPassword: "Passwordnya",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("confirmPassword", () => {
    it("invalid jika tidak cocok dengan password", () => {
      const result = registerSchema.safeParse({
        ...validRegister,
        password: "Password1",
        confirmPassword: "Password2",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain("confirmPassword");
      }
    });
  });
});