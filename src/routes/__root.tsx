import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";

function NotFoundComponent() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/dashboard" className="btn" style={{ display: "inline-block", marginTop: 12 }}>
        Go to Dashboard
      </Link>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Team Task Manager" },
      { name: "description", content: "Team Task Manager - manage projects and tasks" },
      { property: "og:title", content: "Team Task Manager" },
      { name: "twitter:title", content: "Team Task Manager" },
      { property: "og:description", content: "Team Task Manager - manage projects and tasks" },
      { name: "twitter:description", content: "Team Task Manager - manage projects and tasks" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/80c9a1c4-30ed-48c3-a1d0-1a26116754f3/id-preview-edda8189--447b78ba-bfaf-4500-bebb-ce3ee6b63596.lovable.app-1778125389107.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/80c9a1c4-30ed-48c3-a1d0-1a26116754f3/id-preview-edda8189--447b78ba-bfaf-4500-bebb-ce3ee6b63596.lovable.app-1778125389107.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Navbar />
      <Outlet />
    </AuthProvider>
  );
}
