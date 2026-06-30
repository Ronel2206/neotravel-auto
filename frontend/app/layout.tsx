import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={inter.className}
        style={{
          margin: 0,
          height: "100vh",
          background: "#ffffff",
          color: "#111827",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            width: "100%",
            minHeight: "120px",
            padding: "16px 24px",
            background: "rgba(255, 255, 255, 0.96)",
            borderBottom: "1px solid #e5e7eb",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1440px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              flexWrap: "wrap",
              boxSizing: "border-box",
            }}
          >
            <Link href="/" aria-label="Neotravel" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
              <span
                aria-hidden="true"
                style={{
                  width: "clamp(220px, 28vw, 360px)",
                  height: "auto",
                  aspectRatio: "385 / 123",
                  background: 'url("/images/logo.png") lightgray 50% / contain no-repeat',
                  display: "block",
                }}
              />
            </Link>

            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px 24px",
                flexWrap: "wrap",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Link
                href="/#qui-sommes-nous"
                style={{
                  color: "#4F082E",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(16px, 1.4vw, 20px)",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                Qui sommes nous ?
              </Link>
              <Link
                href="/#reglementation"
                style={{
                  color: "#4F082E",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(16px, 1.4vw, 20px)",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                Réglementation
              </Link>
              <Link
                href="/#avis-client"
                style={{
                  color: "#4F082E",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(16px, 1.4vw, 20px)",
                  fontStyle: "normal",
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                Avis Client
              </Link>
              <Link
                href="/dashboard"
                style={{
                  color: "#4E35D5",
                  textDecoration: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "clamp(16px, 1.4vw, 20px)",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Dashboard
              </Link>
            </nav>

            <Link
              href="/login"
              style={{
                display: "flex",
                minWidth: "168px",
                height: "48px",
                padding: "0 22px",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                borderRadius: "999px",
                background: "#4E35D5",
                color: "#fff",
                textDecoration: "none",
                fontFamily: "Inter, sans-serif",
                fontSize: "clamp(16px, 1.2vw, 18px)",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: 1,
                textAlign: "center",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
              }}
            >
              Se Connecter
            </Link>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}