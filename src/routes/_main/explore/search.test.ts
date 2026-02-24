
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { sanitizeSearchValue, validateExploreSearch } from "./index";


describe("Explore Page Search Validation", () => {
    describe("sanitizeSearchValue", () => {
        it("should return empty string for non-string values", () => {
            expect(sanitizeSearchValue(null)).toBe("");
            expect(sanitizeSearchValue(undefined)).toBe("");
            expect(sanitizeSearchValue(123)).toBe("");
        });

        it("should return the string as is if no pollution", () => {
            expect(sanitizeSearchValue("abc")).toBe("abc");
            expect(sanitizeSearchValue("hot")).toBe("hot");
        });

        it("should strip query params pollution (?rt=...)", () => {
            expect(sanitizeSearchValue("hot?rt=123")).toBe("hot");
            expect(sanitizeSearchValue("all?source=pwa")).toBe("all");
        });

        it("should strip hash pollution (#...)", () => {
            expect(sanitizeSearchValue("hot#section")).toBe("hot");
        });

        it("should strip both query and hash pollution", () => {
            expect(sanitizeSearchValue("hot?rt=123#ui")).toBe("hot");
        });
    });

    describe("validateExploreSearch", () => {
        it("should use 'casino' as default type", () => {
            const result = validateExploreSearch({});
            expect(result.type).toBe("casino");
        });

        it("should validate and clean 'type' parameter", () => {
            expect(validateExploreSearch({ type: "slots" }).type).toBe("slots");
            expect(validateExploreSearch({ type: "slots?rt=123" }).type).toBe("slots");
        });

        it("should validate and clean 'category' parameter", () => {
            expect(validateExploreSearch({ category: "hot" }).category).toBe("hot");

            const polluted = validateExploreSearch({ category: "all?rt=abc" });
            expect(polluted.category).toBe("all");
        });

        it("should not return category if type is fishing", () => {
            const result = validateExploreSearch({ type: "fishing", category: "hot" });
            expect(result.category).toBeUndefined();
        });

        it("should validate and clean 'providers' parameter", () => {
            expect(validateExploreSearch({ providers: "pg" }).providers).toBe("pg");

            const polluted = validateExploreSearch({ providers: "pg?rt=123" });
            expect(polluted.providers).toBe("pg");
        });

        it("should retain valid 'sort' parameter", () => {
            expect(validateExploreSearch({ sort: "popular" }).sort).toBe("popular");
            expect(validateExploreSearch({ sort: "newest" }).sort).toBe("newest");
        });

        it("should clean polluted 'sort' parameter", () => {
            // Before fix: this would likely fail or return polluted string
            const result = validateExploreSearch({ sort: "popular?rt=abc" });
            expect(result.sort).toBe("popular");
        });
    });
});
