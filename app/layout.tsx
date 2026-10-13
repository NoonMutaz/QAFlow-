import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { LANG_COOKIE, type Lang } from "./i18n/config";
// import Header from "./components/header/Header";
import { Providers } from './Providers';
import {SearchProvider} from "./context/SearchContext" 
import { AuthProvider } from "./context/AuthContext";
import {QueueProvider} from "./context/QueueContext" 
import "./globals.css";
import InviteNotifications from "./components/my-projects/InviteNotifications";
   

import HeaderWrapper from "./components/header/HeaderWrapper";
import { ProjectProvider } from "./context/ProjectContext";
 import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Geist has no Arabic glyphs; the browser falls back to this font for Arabic text
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Imtithal · AI-assisted SBC inspection",
  description: "Log site non-conformities from a photo, link them to Saudi Building Code clauses with AI, and track them to a verified fix.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang: Lang = (await cookies()).get(LANG_COOKIE)?.value === "ar" ? "ar" : "en";

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
   
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plexArabic.variable} antialiased`}
      > 
      <LanguageProvider initialLang={lang}>
      <Providers>
        
        
   
       <AuthProvider> 
      <SearchProvider>
        <QueueProvider>  <ProjectProvider>
          <HeaderWrapper />
     

        <InviteNotifications /> 
             {children}
              <Footer/>
         
        </ProjectProvider> </QueueProvider>
         
        </SearchProvider>
 </AuthProvider>
          </Providers>
      </LanguageProvider>   </body>
    </html>
  );
}
