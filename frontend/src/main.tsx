import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import logoImage from "./assets/logo.jpg";

const faviconLink = document.querySelector<HTMLLinkElement>("link[rel='icon']") ?? document.createElement("link");
faviconLink.rel = "icon";
faviconLink.type = "image/jpeg";
faviconLink.href = logoImage;
if (!faviconLink.parentNode) {
  document.head.appendChild(faviconLink);
}

createRoot(document.getElementById("root")!).render(<App />);
