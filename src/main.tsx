import { createRoot } from "react-dom/client";
import { SiteJsonLd } from '@/components/JsonLd';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <SiteJsonLd />
    <App />
  </>
);
