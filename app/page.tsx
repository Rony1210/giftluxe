export default function Home() {
  return (
    <main style={{ fontFamily: "Inter, sans-serif", background: "#fff", minHeight: "100vh" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          Gift<span style={{ color: "#c8a96e" }}>Luxe</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 14, color: "#555" }}>
          <span style={{ cursor: "pointer" }}>Products</span>
          <span style={{ cursor: "pointer" }}>For Business</span>
          <span style={{ cursor: "pointer" }}>Pricing</span>
        </div>
        <button style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 6, fontSize: 14, cursor: "pointer" }}>
          Login
        </button>
      </nav>
      <section style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", color: "#fff", padding: "80px 48px" }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>
          Branded Gifts<br />Your Team<br /><span style={{ color: "#c8a96e" }}>Will Love</span>
        </h1>
        <p style={{ fontSize: 18, color: "#aaa", marginTop: 20 }}>Custom branded merchandise for your business.</p>
        <button style={{ marginTop: 36, background: "#c8a96e", color: "#000", border: "none", padding: "16px 36px", borderRadius: 6, fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
          Browse Products
        </button>
      </section>
      <section style={{ padding: "64px 48px" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 40 }}>Shop by Category</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { name: "Tech & Gadgets", color: "#f0f4ff", icon: "PC" },
            { name: "Lifestyle", color: "#fff4f0", icon: "LF" },
            { name: "Food & Drink", color: "#f0fff4", icon: "FD" },
            { name: "Apparel", color: "#fdf0ff", icon: "AP" },
          ].map((cat) => (
            <div key={cat.name} style={{ background: cat.color, borderRadius: 12, padding: "32px 24px", cursor: "pointer" }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{cat.name}</div>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ background: "#1a1a1a", color: "#888", padding: "32px 48px", display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Gift<span style={{ color: "#c8a96e" }}>Luxe</span></div>
        <div>2025 GiftLuxe. All rights reserved.</div>
      </footer>
    </main>
  );
}