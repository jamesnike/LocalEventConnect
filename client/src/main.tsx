import { createRoot } from "react-dom/client";
import { createElement } from "react";

console.log("Starting main.tsx module...");

// Simple test component without JSX
function TestComponent() {
  return createElement("div", {
    style: { padding: "20px", color: "green", fontSize: "20px" }
  }, [
    createElement("h1", null, "✓ React is working!"),
    createElement("p", null, "Loading EventConnect app...")
  ]);
}

async function initApp() {
  try {
    console.log("Importing CSS...");
    await import("./index.css");
    console.log("CSS imported successfully");

    console.log("Looking for root element...");
    const rootElement = document.getElementById("root");
    console.log("Root element found:", !!rootElement);

    if (rootElement) {
      console.log("Creating React root...");
      const root = createRoot(rootElement);
      console.log("React root created successfully");
      
      console.log("Rendering simple test first...");
      root.render(createElement(TestComponent));
      console.log("Test component rendered");
      
      setTimeout(async () => {
        try {
          console.log("Importing App component...");
          const { default: App } = await import("./App");
          console.log("App component imported successfully");
          
          console.log("Rendering full app...");
          root.render(createElement(App));
          console.log("Full app rendered");
        } catch (error) {
          console.error("Error loading full app:", error);
          root.render(createElement("div", {
            style: { color: "red", padding: "20px" }
          }, `Error: ${error.message}`));
        }
      }, 2000);
    } else {
      console.error("Root element not found!");
      document.body.innerHTML = '<div style="color: red; padding: 20px;">ERROR: Root element not found</div>';
    }
  } catch (error) {
    console.error("Critical error in main.tsx:", error);
    document.body.innerHTML = `<div style="color: red; padding: 20px;">
      <h1>Error loading app</h1>
      <p>Check console for details</p>
      <pre>${error.message}</pre>
    </div>`;
  }
}

initApp();
