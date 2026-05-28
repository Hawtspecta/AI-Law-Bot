import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const faviconUrl = "frontend/src/assets/logo.jpg";

const faviconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']") ?? document.createElement("link");
faviconLink.rel = "icon";
faviconLink.type = "image/png";
faviconLink.href = faviconUrl;
if (!faviconLink.parentNode) {
  document.head.appendChild(faviconLink);
}

createRoot(document.getElementById("root")!).render(<App />);
