import type { menuai } from "../types";

interface Image {
  filesize: number;
  name: string;
  uploaded_at: string; // isoformat date
  content_type: string;
  id: string;
}

export const URL_PREFIX = "/api/image/serve/";
export const MEDIA_PREFIX = "media-source://image_upload";

export interface ImageMutableParams {
  name: string;
}

export const getIdFromUrl = (url: string): string | undefined => {
  let id;
  if (url.startsWith(URL_PREFIX)) {
    id = url.substring(URL_PREFIX.length);
    const idx = id.indexOf("/");
    if (idx >= 0) {
      id = id.substring(0, idx);
    }
  } else if (url.startsWith(MEDIA_PREFIX)) {
    id = url.substring(MEDIA_PREFIX.length + 1);
  }
  return id;
};

export const generateImageThumbnailUrl = (
  mediaId: string,
  size?: number,
  original = false
) => {
  if (!original && !size) {
    throw new Error("Size must be provided if original is false");
  }

  return original
    ? `/api/image/serve/${mediaId}/original`
    : `/api/image/serve/${mediaId}/${size}x${size}`;
};

export const fetchImages = (menuai: menuai) =>
  menuai.callWS<Image[]>({ type: "image/list" });

export const createImage = async (
  menuai: menuai,
  file: File
): Promise<Image> => {
  const fd = new FormData();
  fd.append("file", file);
  const resp = await menuai.fetchWithAuth("/api/image/upload", {
    method: "POST",
    body: fd,
  });
  if (resp.status === 413) {
    throw new Error(`Uploaded image is too large (${file.name})`);
  } else if (resp.status !== 200) {
    throw new Error("Unknown error");
  }
  return resp.json();
};

export const updateImage = (
  menuai: menuai,
  id: string,
  updates: Partial<ImageMutableParams>
) =>
  menuai.callWS<Image>({
    type: "image/update",
    media_id: id,
    ...updates,
  });

export const deleteImage = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "image/delete",
    image_id: id,
  });

export const getImageData = async (menuai: menuai, url: string) => {
  const response = await fetch(menuai.menuaiUrl(url));

  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${
        response.statusText ? response.statusText : response.status
      }`
    );
  }

  return response.blob();
};
