import type { ImageOutputFormat } from "astro";
import { getImage } from "astro:assets";
import {
  RESPONSIVE_WIDTHS,
  OPEN_GRAPH_WIDTH,
  type ResponsiveWidth,
} from "src/constants";

export type ImageType = "default" | "transparent" | "animated";

const fallbackFormats: Record<ImageType, ImageOutputFormat> = {
  default: "jpeg",
  transparent: "png",
  animated: "gif",
};

const mimeTypes: Record<ImageOutputFormat, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  jpg: "image/jpeg",
  svg: "image/svg+xml",
};

type Image = {
  src: string;
  width: number;
  height: number;
};

type SrcSets = { type: string; images: Image[] }[];

class ResponsiveImageSet {
  private readonly acceptableWidths: number[];
  private type: ImageType;
  private fallbackFormat: ImageOutputFormat;

  private sets:
    | {
        avif: Image[];
        webp: Image[];
        legacy: Image[];
      }
    | undefined;

  private _openGraph: Image | undefined;

  constructor(
    private readonly original: ImageMetadata,
    options?: ResponsiveImageSetOptions
  ) {
    this.acceptableWidths = RESPONSIVE_WIDTHS.filter(
      (w) => w <= this.original.width
    );
    this.type = options?.type ?? "default";
    this.fallbackFormat = fallbackFormats[this.type];
  }

  async init(): Promise<void> {
    if (this.sets) {
      return;
    }
    const avif = await this.getSrcset("avif");
    const webp = await this.getSrcset("webp");
    const legacy = await this.getSrcset(this.fallbackFormat);
    this.sets = {
      avif,
      webp,
      legacy,
    };

    this._openGraph =
      legacy.find((image) => image.width === OPEN_GRAPH_WIDTH) ??
      legacy[legacy.length - 1] ??
      (await this.getUltimateFallback());
  }

  private getUltimateFallback = async (): Promise<Image> => {
    const ultimateFallback = await getImage({
      src: this.original,
      width: this.original.width,
      format: this.fallbackFormat,
    });
    return {
      src: ultimateFallback.src,
      width: ultimateFallback.attributes.width,
      height: ultimateFallback.attributes.height,
    };
  };

  get srcSets(): SrcSets {
    if (!this.sets) {
      throw new Error("SrcSets are not initialized");
    }
    return [
      { type: mimeTypes.avif, images: this.sets.avif },
      { type: mimeTypes.webp, images: this.sets.webp },
      { type: mimeTypes[this.fallbackFormat]!, images: this.sets.legacy },
    ];
  }

  async getFallback(fallbackWidth: ResponsiveWidth): Promise<Image> {
    if (!this.sets) {
      throw new Error("SrcSets are not initialized");
    }
    const { legacy } = this.sets;
    return (
      legacy.find((image) => image.width === fallbackWidth) ??
      legacy[legacy.length - 1] ??
      (await this.getUltimateFallback())
    );
  }

  get openGraph(): Image {
    if (!this._openGraph) {
      throw new Error("SrcSets are not initialized");
    }
    return this._openGraph;
  }

  private async getSrcset(format: ImageOutputFormat): Promise<Image[]> {
    return Promise.all(
      this.acceptableWidths.map(async (width) => {
        const image = await getImage({
          src: this.original,
          width,
          format,
        });
        return {
          src: image.src,
          width: image.attributes.width,
          height: image.attributes.height,
        };
      })
    );
  }
}

const responsiveImages: Map<string, ResponsiveImageSet> = new Map();

export type ResponsiveImageSetOptions = {
  type?: ImageType | undefined;
};

export const getResponsiveImage = async (
  src: ImageMetadata,
  options?: ResponsiveImageSetOptions
) => {
  const existing = responsiveImages.get(src.src);
  if (existing) {
    return existing;
  }
  const responsiveImage = new ResponsiveImageSet(src, options);
  await responsiveImage.init();
  responsiveImages.set(src.src, responsiveImage);
  return responsiveImage;
};
