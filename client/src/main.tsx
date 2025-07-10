import { createRoot } from "react-dom/client";
import App from "./App";
import TestApp from "./TestApp";
import "./index.css";

console.log("React app starting...");

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    console.log("Root created successfully");
    
    // Test with simple component first
    root.render(<TestApp />);
    console.log("Test app rendered successfully");
    
    // Switch to full app after 2 seconds
    setTimeout(() => {
      console.log("Switching to full app");
      root.render(<App />);
      console.log("Full app rendered successfully");
    }, 2000);
  } catch (error) {
    console.error("Error rendering app:", error);
  }
} else {
  console.error("Root element not found");
}
