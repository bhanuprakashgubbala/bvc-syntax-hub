import "./globals.css";
import { UserProvider } from "@/context/UserContext";

export const metadata = {
  title: "BVC CODELAB - Bonam Venkatachalam Engineering College (Autonomous)",
  description: "Smart Digital Lab Observation, Code Space & Academic Management System - BVCEC Odalarevu",
  icons: {
    icon: "/bvc-logo.png",
    apple: "/bvc-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-200 min-h-screen font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
