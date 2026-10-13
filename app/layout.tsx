import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Imtithal · AI-assisted SBC inspection",
  description: "Log site non-conformities from a photo, link them to Saudi Building Code clauses with AI, and track them to a verified fix.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
   
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
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
          </Providers>   </body>
    </html>
  );
}
