import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./coach.css";

const SITE_TITLE = "수능人 | 국영수 노베이스 입시 로드맵";
const SITE_DESCRIPTION =
  "국어·영어·수학 상세 로드맵, 수학 개념 문제, SRS 단어장, EBS 공식 입문 강의 연결을 한 화면에서 관리하는 모바일 입시 학습 코치입니다.";
const METADATA_ORIGIN = "https://first-kan-study.blessedjsb.chatgpt.site";

export function generateMetadata(): Metadata {
  const metadataBase = new URL(METADATA_ORIGIN);
  const socialImage = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: {
      default: SITE_TITLE,
      template: "%s | 수능人",
    },
    description: SITE_DESCRIPTION,
    applicationName: "수능人",
    keywords: [
      "수능",
      "입시",
      "노베이스",
      "국어 공부법",
      "영어 단어장",
      "수학 문제",
      "EBSi",
      "SRS 단어장",
      "학습관리",
    ],
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      type: "website",
      locale: "ko_KR",
      siteName: "수능人",
      images: [
        {
          url: socialImage,
          width: 1672,
          height: 941,
          alt: "수능人 - 국영수 노베이스 입시 로드맵, 수학 문제, SRS 단어장, EBS 연결",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d261f",
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
