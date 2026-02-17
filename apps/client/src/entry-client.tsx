import { hydrateRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./app/App";
import "sonner/dist/styles.css";
import "./styles/index.css";

hydrateRoot(
  document.getElementById("root")!,
  <>
    <App />
    <Toaster position="bottom-center" richColors />
  </>,
);
