import { createRoot } from "react-dom/client";
import App from "./App";
import SimpleApp from "./SimpleApp";
import "./index.css";

console.log("React main.tsx loading...");

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready, starting React app...");
  
  const rootElement = document.getElementById("root");
  console.log("Root element:", rootElement);
  
  if (rootElement) {
    console.log("Creating React root...");
    const root = createRoot(rootElement);
    console.log("React root created, rendering app...");
    
    root.render(<SimpleApp />);
    console.log("SimpleApp rendered successfully");
  } else {
    console.error("Root element not found!");
  }
});

// Also try immediately in case DOM is already loaded
if (document.readyState === "loading") {
  console.log("DOM still loading, waiting for DOMContentLoaded...");
} else {
  console.log("DOM already loaded, starting React app immediately...");
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<SimpleApp />);
  }
}
