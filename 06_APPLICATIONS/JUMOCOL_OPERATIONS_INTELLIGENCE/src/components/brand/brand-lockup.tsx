import Image from "next/image";

import { CORPORATE_BRAND } from "@/config/brand";

type BrandLockupProps = {
  placement: "sidebar" | "mobile" | "home";
};

const presentation = {
  sidebar: {
    className: "h-auto w-full max-w-[196px]",
    sizes: "196px",
  },
  mobile: {
    className: "h-auto w-full max-w-[116px]",
    sizes: "116px",
  },
  home: {
    className: "h-auto w-full max-w-[220px] sm:max-w-[250px]",
    sizes: "(max-width: 640px) 220px, 250px",
  },
} as const;

export function BrandLockup({ placement }: BrandLockupProps) {
  const logo = CORPORATE_BRAND.logo;
  const selectedPresentation = presentation[placement];

  return (
    <Image
      alt={logo.alt}
      className={selectedPresentation.className}
      height={logo.height}
      loading="eager"
      sizes={selectedPresentation.sizes}
      src={logo.src}
      width={logo.width}
    />
  );
}
