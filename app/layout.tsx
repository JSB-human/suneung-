import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_TITLE = "첫칸 | 노베이스 수능 학습 코치";
const SITE_DESCRIPTION =
  "기초 개념부터 단어 복습, EBS 강의 연계까지 오늘 할 공부를 한 칸씩 안내하는 수능 학습 코치입니다.";
const METADATA_ORIGIN = "http://localhost:3000";

export function generateMetadata(): Metadata {
  const metadataBase = new URL(METADATA_ORIGIN);
  const socialImage = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: {
      default: SITE_TITLE,
      template: "%s | 첫칸",
    },
    description: SITE_DESCRIPTION,
    applicationName: "첫칸",
    keywords: ["수능", "입시", "노베이스", "EBS", "학습관리", "단어장"],
    openGraph: {
      title: SITE_TITLE,
      description: "막막한 수능 공부, 오늘 할 한 칸부터 시작하세요.",
      type: "website",
      locale: "ko_KR",
      siteName: "첫칸",
      images: [
        {
          url: socialImage,
          width: 1735,
          height: 909,
          alt: "첫칸 - 노베이스 수능생의 오늘 할 한 칸",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: "막막한 수능 공부, 오늘 할 한 칸부터 시작하세요.",
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f5ef",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
