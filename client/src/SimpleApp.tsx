export default function SimpleApp() {
  return (
    <div style={{ padding: "20px", color: "purple", fontSize: "24px" }}>
      <h1>🎉 Simple React App Working!</h1>
      <p>This confirms React is rendering correctly.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}