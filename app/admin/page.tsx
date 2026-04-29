"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPage() {
  const [section, setSection] = useState("dashboard");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => { loadCategories(); loadProducts(); }, []);

  async function loadCategories() {
    const { data } = await supabase.from("categories").select("*");
    if (data) setCategories(data);
  }

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*");
    if (data) setProducts(data);
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    await supabase.from("categories").insert({ name: newCatName, slug: newCatName.toLowerCase().replace(/\s+/g, "-") });
    setNewCatName("");
    loadCategories();
  }

  async function deleteCategory(id) {
    await supabase.from("categories").delete().eq("id", id);
    loadCategories();
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: 220, background: "#1a1a1a", color: "#fff", padding: "24px 0" }}>
        <div style={{ padding: "0 24px 24px", fontSize: 20, fontWeight: 700, borderBottom: "1px solid #333" }}>
          GiftLuxe <span style={{ color: "#c8a96e" }}>Admin</span>
        </div>
        <div style={{ padding: "16px 0" }}>
          {["dashboard","categories","products","homepage"].map(s => (
            <span key={s} onClick={() => setSection(s)} style={{ display: "block", padding: "12px 24px", cursor: "pointer", color: section === s ? "#c8a96e" : "#aaa", background: section === s ? "#c8a96e22" : "transparent", borderLeft: section === s ? "3px solid #c8a96e" : "3px solid transparent", fontSize: 14, textTransform: "capitalize" }}>
              {s}
            </span>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          <button onClick={() => window.open("/","_blank")} style={{ width: "100%", padding: "10px", background: "#c8a96e", color: "#000", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
            View Site
          </button>
        </div>
      </div>
      <div style={{ flex: 1, background: "#f9f9f9", padding: 32 }}>
        {section === "dashboard" && (
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {[{ label: "Categories", value: categories.length },{ label: "Products", value: products.length },{ label: "Orders", value: 0 }].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#c8a96e" }}>{s.value}</div>
                  <div style={{ fontSize: 14, color: "#888" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {section === "categories" && (
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Categories</div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #e5e5e5", fontSize: 14, width: "100%", marginBottom: 12 }} />
              <button onClick={addCategory} style={{ padding: "10px 20px", background: "#c8a96e", color: "#000", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>Add Category</button>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span>{cat.name}</span>
                  <button onClick={() => deleteCategory(cat.id)} style={{ padding: "6px 16px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer" }}>Delete</button>
                </div>
              ))}
              {categories.length === 0 && <div style={{ color: "#888", textAlign: "center", padding: 32 }}>No categories yet</div>}
            </div>
          </div>
        )}
        {section === "products" && (
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Products</div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
              {products.length === 0 && <div style={{ color: "#888", textAlign: "center", padding: 32 }}>No products yet</div>}
            </div>
          </div>
        )}
        {section === "homepage" && (
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Homepage Manager</div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
              <p style={{ color: "#888" }}>Coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}