"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminPage() {
  const [section, setSection] = useState("dashboard");
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#f0f4ff");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadAll();
  }, []);

  function getSupabase() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );
  }

  async function loadAll() {
    const supabase = getSupabase();
    const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
    if (cats) setCategories(cats);
    const { data: prods } = await supabase.from("products").select("*");
    if (prods) setProducts(prods);
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    const supabase = getSupabase();
    await supabase.from("categories").insert({
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, "-"),
      color: newCatColor
    });
    setNewCatName("");
    loadAll();
  }

  async function deleteCategory(id: string) {
    const supabase = getSupabase();
    await supabase.from("categories").delete().eq("id", id);
    loadAll();
  }

  if (!mounted) return <div style={{padding:32}}>Loading...</div>;

  return (
    <div style={{display:"flex",minHeight:"100vh",fontFamily:"Inter,sans-serif"}}>
      <div style={{width:220,background:"#1a1a1a",color:"#fff",padding:"24px 0",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"0 24px 24px",fontSize:20,fontWeight:700,borderBottom:"1px solid #333"}}>
          Gift<span style={{color:"#c8a96e"}}>Luxe</span> Admin
        </div>
        <div style={{padding:"16px 0",flex:1}}>
          {["dashboard","categories","products","homepage"].map(s => (
            <span key={s} onClick={() => setSection(s)} style={{display:"block",padding:"12px 24px",cursor:"pointer",color:section===s?"#c8a96e":"#aaa",background:section===s?"#c8a96e22":"transparent",borderLeft:section===s?"3px solid #c8a96e":"3px solid transparent",fontSize:14,textTransform:"capitalize"}}>
              {s}
            </span>
          ))}
        </div>
        <div style={{padding:24}}>
          <button onClick={() => window.open("/","_blank")} style={{width:"100%",padding:"10px",background:"#c8a96e",color:"#000",border:"none",borderRadius:6,cursor:"pointer",fontWeight:600,fontSize:14}}>
            View Site
          </button>
        </div>
      </div>
      <div style={{flex:1,background:"#f9f9f9",padding:32}}>

        {section === "dashboard" && (
          <div>
            <div style={{fontSize:24,fontWeight:700,marginBottom:24}}>Dashboard</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
              {[{label:"Categories",value:categories.length,color:"#c8a96e"},{label:"Products",value:products.length,color:"#4f6ef7"},{label:"Orders",value:0,color:"#4faf6e"}].map(s => (
                <div key={s.label} style={{background:"#fff",borderRadius:12,padding:24}}>
                  <div style={{fontSize:36,fontWeight:800,color:s.color}}>{s.value}</div>
                  <div style={{fontSize:14,color:"#888",marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === "categories" && (
          <div>
            <div style={{fontSize:24,fontWeight:700,marginBottom:24}}>Categories</div>
            <div style={{background:"#fff",borderRadius:12,padding:24,marginBottom:24}}>
              <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>Add New Category</div>
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" style={{padding:"10px 14px",borderRadius:6,border:"1px solid #e5e5e5",fontSize:14,width:"100%",marginBottom:12,boxSizing:"border-box"}} />
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <label style={{fontSize:13,color:"#666"}}>Color:</label>
                <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} style={{width:40,height:36,border:"none",borderRadius:4,cursor:"pointer"}} />
              </div>
              <button onClick={addCategory} style={{padding:"10px 24px",background:"#c8a96e",color:"#000",border:"none",borderRadius:6,cursor:"pointer",fontWeight:600,fontSize:14}}>Add Category</button>
            </div>
            <div style={{background:"#fff",borderRadius:12,padding:24}}>
              <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>All Categories ({categories.length})</div>
              {categories.length === 0 && <div style={{color:"#888",textAlign:"center",padding:32}}>No categories yet</div>}
              {categories.map(cat => (
                <div key={cat.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid #f0f0f0"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:16,height:16,borderRadius:4,background:cat.color||"#f0f4ff"}}></div>
                    <span style={{fontWeight:500}}>{cat.name}</span>
                  </div>
                  <button onClick={() => deleteCategory(cat.id)} style={{padding:"6px 16px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer",fontSize:13}}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === "products" && (
          <div>
            <div style={{fontSize:24,fontWeight:700,marginBottom:24}}>Products</div>
            <div style={{background:"#fff",borderRadius:12,padding:24}}>
              {products.length === 0 && <div style={{color:"#888",textAlign:"center",padding:32}}>No products yet</div>}
            </div>
          </div>
        )}

        {section === "homepage" && (
          <div>
            <div style={{fontSize:24,fontWeight:700,marginBottom:24}}>Homepage Manager</div>
            <div style={{background:"#fff",borderRadius:12,padding:24}}>
              <p style={{color:"#888"}}>Coming soon</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}