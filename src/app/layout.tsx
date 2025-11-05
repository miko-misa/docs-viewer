import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_JP, JetBrains_Mono, M_PLUS_1_Code } from "next/font/google";
import "./globals.css";
import { PreviewProvider } from "@/contexts/PreviewContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const notoSans = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const mPlusCode = M_PLUS_1_Code({
  variable: "--font-mplus1-code",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Docs Viewer",
  description: "ローカルの Markdown を Typst 数式付きで表示するドキュメントビューア",
};

const themeInitScript = `
(function() {
  try {
    var storageKey = 'docs-viewer-theme';
    var stored = window.localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
      return;
    }
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } catch (error) {
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body
        className={`${notoSans.variable} ${jetBrainsMono.variable} ${mPlusCode.variable} antialiased`}
      >
        <ThemeProvider>
          <PreviewProvider>{children}</PreviewProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
