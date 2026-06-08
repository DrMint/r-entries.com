import { getImage } from "astro:assets";
import {
  RESPONSIVE_WIDTHS,
  OPEN_GRAPH_WIDTH,
  type ResponsiveWidth,
} from "src/constants";

export type ImageType = "default" | "transparent" | "animated";
type ImageFormat = "avif" | "webp" | "jpeg" | "png" | "gif";

const fallbackFormats: Record<ImageType, ImageFormat> = {
  default: "jpeg",
  transparent: "png",
  animated: "gif",
};

const mimeTypes: Record<ImageFormat, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
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
  private fallbackFormat: ImageFormat;
  private square: boolean;

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
      (w) =>
        w <= this.original.width &&
        (options?.maxWidth ? w <= options.maxWidth : true)
    );
    this.type = options?.type ?? "default";
    this.fallbackFormat = fallbackFormats[this.type];
    this.square = options?.square ?? false;
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
      { type: mimeTypes[this.fallbackFormat], images: this.sets.legacy },
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

  private async getSrcset(format: ImageFormat): Promise<Image[]> {
    return Promise.all(
      this.acceptableWidths.map(async (width) => {
        const image = await getImage({
          src: this.original,
          width,
          height: this.square ? width : undefined,
          fit: this.square ? "cover" : undefined,
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

export type ResponsiveImageSetOptions = {
  type?: ImageType | undefined;
  square?: boolean | undefined;
  maxWidth?: number | undefined;
};

export const getResponsiveImage = async (
  src: ImageMetadata,
  options?: ResponsiveImageSetOptions
) => {
  // If the image is within 5% of already being a square,
  // we don't need to create a square version
  const imageRatio = src.width / src.height;
  const square = options?.square && Math.abs(imageRatio - 1) > 0.05;

  const responsiveImage = new ResponsiveImageSet(src, {
    type: options?.type,
    square,
    maxWidth: options?.maxWidth,
  });

  await responsiveImage.init();
  return responsiveImage;
};
