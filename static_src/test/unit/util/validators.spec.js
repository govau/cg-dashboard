import { validateInteger, validateEmail } from "../../../util/validators";

describe("validateEmail", () => {
  it("returns a function", () => {
    expect(typeof validateEmail()).toBe("function");
  });

  describe("given no options", () => {
    let validator;
    beforeEach(() => {
      validator = validateEmail();
    });

    it("fails for empty", () => {
      const result = validator();

      expect(result).toEqual({
        message: "The value entered is not a valid email address"
      });
    });
  });

  describe("given string", () => {
    let validator;
    beforeEach(() => {
      validator = validateEmail();
    });

    it("fails for none emails string", () => {
      const result = validator("domain");

      expect(result).toEqual({
        message: "The value entered is not a valid email address"
      });
    });

    it("fails for none emails string@", () => {
      const result = validator("domain@");

      expect(result).toEqual({
        message: "The value entered is not a valid email address"
      });
    });

    it("fails for none emails string@domain.", () => {
      const result = validator("domain@domain.");

      expect(result).toEqual({
        message: "The value entered is not a valid email address"
      });
    });

    it("fails for none emails string@string", () => {
      const result = validator("domain@place");

      expect(result).toEqual(null);
    });

    it("fails for none emails string@string.com.co", () => {
      const result = validator("domain@place");

      expect(result).toEqual(null);
    });

    it("succeeds for email", () => {
      const result = validator("domain@place.com");

      expect(result).toEqual(null);
    });
  });
});

describe("vaidateNumber", () => {
  it("returns a function", () => {
    expect(typeof validateInteger()).toBe("function");
  });

  describe("given no options", () => {
    let validator;
    beforeEach(() => {
      validator = validateInteger();
    });

    it("fails for empty", () => {
      const result = validator();

      expect(result).toEqual({
        message: "Invalid number",
        type: "NUMBER_INVALID"
      });
    });

    it("fails for 1234asdf", () => {
      const result = validator("1234asdf");

      expect(result).toEqual({
        message: "Invalid number",
        type: "NUMBER_INVALID"
      });
    });

    it("fails for NaN", () => {
      const result = validator("Not a number");

      expect(result).toEqual({
        message: "Invalid number",
        type: "NUMBER_INVALID"
      });
    });

    it("fails for float string", () => {
      const result = validator("13.37");

      expect(result).toEqual({
        message: "Invalid number",
        type: "NUMBER_INVALID"
      });
    });

    it("passes for number string", () => {
      const result = validator("137");

      expect(result).toBe(null);
    });

    it("passes for negative number string", () => {
      const result = validator("-137");

      expect(result).toBe(null);
    });

    it("passes for zero", () => {
      const result = validator("0");

      expect(result).toBe(null);
    });
  });

  describe("given max", () => {
    let validator;

    beforeEach(() => {
      validator = validateInteger({ max: 1024 });
    });

    it("fails for above max", () => {
      const result = validator("1025");

      expect(result).toEqual({
        message: "Total exceeds 1024",
        type: "NUMBER_MAX"
      });
    });

    it("accepts max", () => {
      const result = validator("1024");

      expect(result).toBe(null);
    });

    it("accepts below max", () => {
      const result = validator("1023");

      expect(result).toBe(null);
    });
  });

  describe("given min", () => {
    let validator;

    beforeEach(() => {
      validator = validateInteger({ min: 1 });
    });

    it("fails for below min", () => {
      const result = validator("0");

      expect(result).toEqual({
        message: "Total must be 1 or greater",
        type: "NUMBER_MIN"
      });
    });

    it("accepts min", () => {
      const result = validator("1");

      expect(result).toBe(null);
    });

    it("accepts above min", () => {
      const result = validator("2");

      expect(result).toBe(null);
    });
  });

  describe("given min and max", () => {
    let validator;

    beforeEach(() => {
      validator = validateInteger({ min: 1, max: 1024 });
    });

    it("fails invalid", () => {
      const result = validator("None");

      expect(result).toEqual({
        message: "Invalid number",
        type: "NUMBER_INVALID"
      });
    });

    it("fails below min", () => {
      const result = validator("0");

      expect(result).toEqual({
        message: "Total must be 1 or greater",
        type: "NUMBER_MIN"
      });
    });

    it("fails above max", () => {
      const result = validator("1025");

      expect(result).toEqual({
        message: "Total exceeds 1024",
        type: "NUMBER_MAX"
      });
    });

    it("accepts between max and min", () => {
      const result = validator("1000");

      expect(result).toBe(null);
    });

    it("accepts min", () => {
      const result = validator("1");

      expect(result).toBe(null);
    });

    it("accepts max", () => {
      const result = validator("1024");

      expect(result).toBe(null);
    });
  });
});
