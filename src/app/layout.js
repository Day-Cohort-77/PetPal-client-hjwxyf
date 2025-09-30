import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider,  } from '../contexts/ThemeContext';
import ThemedApp from '../app/theme/ThemedApp';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({ subsets: ['latin'] });






export const metadata = {
  title: "PetPal - Pet Management System",
  description: "A comprehensive pet management system for pet owners and veterinarians",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <ThemedApp>
              {children}
            </ThemedApp>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


