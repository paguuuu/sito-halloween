import "./globals.css";
export const metadata = { title: "RIFELLOWEEN · 31.10.26", description: "Festa di Halloween in stile americano. 31 ottobre 2026, dalle 23:00." };
export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik+Wet+Paint&family=Special+Elite&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
