import { describe, it, expect } from "vitest";
import { getAreaContext } from "../../../../src/common/entity/context/get_area_context";
import type { menuai } from "../../../../src/types";
import { mockArea, mockFloor } from "./context-mock";

describe("getAreaContext", () => {
  it("should return the correct context when the area exists without a floor", () => {
    const area = mockArea({
      area_id: "area_1",
    });

    const menuai = {
      areas: {
        area_1: area,
      },
      floors: {},
    } as unknown as menuai;

    const result = getAreaContext(area, menuai);

    expect(result).toEqual({
      area,
      floor: null,
    });
  });

  it("should return the correct context when the area exists with a floor", () => {
    const area = mockArea({
      area_id: "area_2",
      floor_id: "floor_1",
    });

    const floor = mockFloor({
      floor_id: "floor_1",
    });

    const menuai = {
      areas: {
        area_2: area,
      },
      floors: {
        floor_1: floor,
      },
    } as unknown as menuai;

    const result = getAreaContext(area, menuai);

    expect(result).toEqual({
      area,
      floor,
    });
  });
});
