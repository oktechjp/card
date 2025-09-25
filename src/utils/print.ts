import { Canvg } from "canvg";
import { codecs } from "@/utils/codecs";
import { AbortError } from "@/utils/AbortError";

export function svgToDataURI(elem: SVGSVGElement | string): string {
  const svg = typeof elem === "string" ? elem : elem.outerHTML;
  return `data:image/svg+xml;base64,${codecs.base64.encode(codecs.utf8.encode(svg))}`;
}

export function loadImage(uri: string, opts?: { signal: AbortSignal }) {
  const signal = opts?.signal;
  return new Promise<HTMLOrSVGImageElement>((resolve, reject) => {
    const doc = globalThis.document;
    if (!doc) {
      reject(new Error("Not in a browser context"));
      return;
    }
    const img = doc.createElement("img");
    const unlisten = () => {
      img.removeAttribute("href");
      img.onabort = null;
      img.onerror = null;
      img.onload = null;
      signal?.removeEventListener("abort", cancel);
    };
    const cancel = () => {
      unlisten();
      reject(new AbortError());
    };
    signal?.addEventListener("abort", cancel);
    img.onload = () => {
      unlisten();
      resolve(img);
    };
    img.onabort = cancel;
    img.onerror = (error) => {
      unlisten();
      reject(typeof error === "string" ? new Error(error) : error);
    };
    img.src = uri;
    img.style.position = "absolute";
    img.style.left = "-10000px";
    doc.body.appendChild(img);
  });
}

export type SVGToImageProps = {
  scaleFactor?: number;
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#browser_compatibility
  type?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number;
};

export async function svgToImage(elem: SVGSVGElement, opts?: SVGToImageProps) {
  const { width, height } = elem.viewBox.baseVal;
  const doc = globalThis.document;
  if (!doc) {
    throw new Error("Not in a browser context");
  }
  const canvas = doc.createElement("canvas");
  const scaleFactor = opts?.scaleFactor ?? 1;
  canvas.width = width * scaleFactor;
  canvas.height = height * scaleFactor;
  const ctx = canvas.getContext("2d", {
    alpha: true,
    colorSpace: "display-p3",
  });
  if (!ctx) {
    throw new Error("Cant get context");
  }
  const canvg = await Canvg.from(ctx, elem.outerHTML, {
    ignoreDimensions: true,
  });
  await canvg.ready();
  await canvg.render();
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("no blob created"));
      },
      opts?.type ?? "image/png",
      opts?.quality ?? 1,
    );
  });
}

export async function openSvgImage(
  elem: SVGSVGElement,
  opts?: SVGToImageProps,
) {
  if (!globalThis.open) {
    throw new Error("Not in browser context (open missing)");
  }
  const blob = await svgToImage(elem, opts);
  const dataUri = URL.createObjectURL(blob);
  globalThis.open(dataUri, "_blank");
}

export async function downloadSvgImage(
  elem: SVGSVGElement,
  name: string,
  opts?: SVGToImageProps,
) {
  const doc = globalThis.document;
  if (!doc) {
    throw new Error("Not in browser context (doc missing)");
  }
  const blob = await svgToImage(elem, opts);
  const a = doc.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}
