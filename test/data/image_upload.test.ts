import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getIdFromUrl,
  generateImageThumbnailUrl,
  fetchImages,
  createImage,
  updateImage,
  deleteImage,
  getImageData,
  URL_PREFIX,
  MEDIA_PREFIX,
} from "../../src/data/image_upload";
import type { menuai } from "../../src/types";

describe("image_upload", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getIdFromUrl", () => {
    it("should extract id from URL_PREFIX", () => {
      const url = `${URL_PREFIX}12345/some/path`;
      const id = getIdFromUrl(url);
      expect(id).toBe("12345");
    });

    it("should extract id from MEDIA_PREFIX", () => {
      const url = `${MEDIA_PREFIX}/12345`;
      const id = getIdFromUrl(url);
      expect(id).toBe("12345");
    });

    it("should return undefined for invalid url", () => {
      const url = "invalid_url";
      const id = getIdFromUrl(url);
      expect(id).toBeUndefined();
    });
  });

  describe("generateImageThumbnailUrl", () => {
    it("should generate thumbnail URL with size", () => {
      const url = generateImageThumbnailUrl("12345", 100);
      expect(url).toBe("/api/image/serve/12345/100x100");
    });

    it("should generate original image URL", () => {
      const url = generateImageThumbnailUrl("12345", undefined, true);
      expect(url).toBe("/api/image/serve/12345/original");
    });

    it("should throw error if size is not provided and original is false", () => {
      expect(() => generateImageThumbnailUrl("12345")).toThrow(
        "Size must be provided if original is false"
      );
    });
  });

  describe("fetchImages", () => {
    it("should fetch images", async () => {
      const menuai = {
        callWS: vi.fn().mockResolvedValue([]),
      } as unknown as menuai;
      const images = await fetchImages(menuai);
      expect(menuai.callWS).toHaveBeenCalledWith({ type: "image/list" });
      expect(images).toEqual([]);
    });
  });

  describe("createImage", () => {
    it("should create an image", async () => {
      const file = new File([""], "image.png", { type: "image/png" });
      const menuai = {
        fetchWithAuth: vi.fn().mockResolvedValue({
          status: 200,
          json: vi.fn().mockResolvedValue({ id: "12345" }),
        }),
      } as unknown as menuai;
      const image = await createImage(menuai, file);
      expect(menuai.fetchWithAuth).toHaveBeenCalled();
      expect(image).toEqual({ id: "12345" });
    });

    it("should throw error if image is too large", async () => {
      const file = new File([""], "image.png", { type: "image/png" });
      const menuai = {
        fetchWithAuth: vi.fn().mockResolvedValue({ status: 413 }),
      } as unknown as menuai;
      await expect(createImage(menuai, file)).rejects.toThrow(
        "Uploaded image is too large (image.png)"
      );
    });

    it("should throw error if fetch fails", async () => {
      const file = new File([""], "image.png", { type: "image/png" });
      const menuai = {
        fetchWithAuth: vi.fn().mockResolvedValue({ status: 500 }),
      } as unknown as menuai;
      await expect(createImage(menuai, file)).rejects.toThrow("Unknown error");
    });
  });

  describe("updateImage", () => {
    it("should update an image", async () => {
      const menuai = {
        callWS: vi.fn().mockResolvedValue({}),
      } as unknown as menuai;
      const updates = { name: "new name" };
      await updateImage(menuai, "12345", updates);
      expect(menuai.callWS).toHaveBeenCalledWith({
        type: "image/update",
        media_id: "12345",
        ...updates,
      });
    });
  });

  describe("deleteImage", () => {
    it("should delete an image", async () => {
      const menuai = {
        callWS: vi.fn().mockResolvedValue({}),
      } as unknown as menuai;
      await deleteImage(menuai, "12345");
      expect(menuai.callWS).toHaveBeenCalledWith({
        type: "image/delete",
        image_id: "12345",
      });
    });
  });

  describe("getImageData", () => {
    const menuai = {
      menuaiUrl: vi.fn((url) => url),
    } as unknown as menuai;
    it("should fetch image data", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob()),
      });
      const data = await getImageData(menuai, "http://example.com/image.png");
      expect(global.fetch).toHaveBeenCalledWith("http://example.com/image.png");
      expect(data).toBeInstanceOf(Blob);
    });

    it("should throw error if fetch fails", async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValue({ ok: false, statusText: "Not Found" });
      await expect(
        getImageData(menuai, "http://example.com/image.png")
      ).rejects.toThrow("Failed to fetch image: Not Found");
    });
  });
});
