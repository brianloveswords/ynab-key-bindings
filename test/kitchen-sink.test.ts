import * as sink from "../src/kitchen-sink";

describe("kitchen sink utilities", () => {
    it("isEmpty", () => {
        expect(sink.isEmpty([])).toBe(true);
        expect(sink.isEmpty("")).toBe(true);
        expect(sink.isEmpty({ length: 0 })).toBe(true);
        expect(sink.isEmpty(new Map())).toBe(true);
        expect(sink.isEmpty(new Set())).toBe(true);
        expect(sink.isEmpty([1])).toBe(false);
        expect(sink.isEmpty(new Set([1]))).toBe(false);
    });
    it("arrayDifference", () => {
        expect(sink.arrayDifference([1, 2, 3], [3, 4, 5])).toMatchObject([
            1,
            2,
        ]);
    });
    it("isIntersection", () => {
        expect(sink.hasIntersection([1, 2, 3], [3, 4, 5])).toBe(true);
        expect(sink.hasIntersection([1, 2], [3, 4, 5])).toBe(false);
    });
    it("isSubset", () => {
        expect(sink.isSubset([3, 2, 1], [1, 2, 3, 4])).toBe(true);
        expect(sink.isSubset([1, 2, 3, 4], [1, 2, 3])).toBe(false);
    });
    it("lastWithRest", () => {
        expect(sink.lastWithRest([1, 2, 3, 4])).toMatchObject([4, [1, 2, 3]]);
    });
});
