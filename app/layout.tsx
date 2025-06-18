import type { Metadata } from "next";
import { DM_Sans,Geist } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/frontend/components/theme-provider";
import 'katex/dist/katex.min.css';
import { ClerkProvider } from "@clerk/nextjs";


const dm_sans = DM_Sans({
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});


export const metadata: Metadata = {
  title: "FastChat",
  description: "Fastest AI Chat App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={`${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}`}>
      <html 
      lang="en"
      suppressHydrationWarning
      >

        <body
          className={` ${geistSans.variable} ${dm_sans.className}  antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            
              {children}
            
          </ThemeProvider>
          
        </body>
      </html>
    </ClerkProvider>
  );
}
