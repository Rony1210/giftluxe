"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminPage() {
  const [section, setSection] = useState("dashboard");
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category_id: "",
    base_price: "",
    allow_logo: true,
    allow_text: true,
    max_chars: 50,
  });
  const [variants, setVariants] = useState<{type:string, values:string}[]>([]);
  const [printAreas, setPrintAreas] = useState<any[]>([]);
  const [fonts, setFonts] = useState(["Arial", "Georgia", "Courier New"]);
  const [textColors, setTextColors] = useState(["#000000", "#ffffff", "#c8a96e"]);
  const [newFont, setNewFont] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [printAreaImg, setPrintAreaImg] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({x:0, y:0});
  const [currentArea, setCurrentArea] = useState<any>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); loadAll(); }, []);

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
    const { data: prods } = await supabase.from("products").select("*,categories(name)");
    if (prods) setProducts(prods);
  }

  async function uploadImages(): Promise<string[]> {
    const supabase = getSupabase();
    const urls: string[] = [];
    for (const file of images) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("products").upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage.from("products").getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }

  async function saveProduct() {
    if (!newProduct.name || !newProduct.base_price) return alert("Name and price required");
    setUploading(true);
    const supabase = getSupabase();
    const imageUrls = await uploadImages();
    await supabase.from("products").insert({
      name: newProduct.name,
      description: newProduct.description,
      category_id: newProduct.category_id || null,
      base_price: parseFloat(newProduct.base_price),
      allow_logo: newProduct.allow_logo,
      allow_text: newProduct.allow_text,
      max_chars: newProduct.max_chars,
      images: imageUrls,
      variants: variants,
      print_areas: printAreas,
      fonts: { available: fonts, default: fonts[0] },
      text_colors: textColors,
      active: true,
    });
    setUploading(false);
    setShowAddProduct(false);
    setNewProduct({ name:"", description:"", category_id:"", base_price:"", allow_logo:true, allow_text:true, max_chars:50 });
    setVariants([]);
    setPrintAreas([]);
    setImages([]);
    loadAll();
  }

  async function deleteProduct(id: string) {
    const supabase = getSupabase();
    await supabase.from("products").delete().eq("id", id);
    loadAll();
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawing(true);
    setStartPos({x, y});
    setCurrentArea({x, y, width:0, height:0, type:"logo"});
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!drawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentArea({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y),
      type: "logo"
    });
  }

  function handleMouseUp() {
    if (!drawing || !currentArea) return;
    setDrawing(false);
    if (currentArea.width > 2 && currentArea.height > 2) {
      setPrintAreas(prev => [...prev, { ...currentArea, id: Date.now() }]);
    }
    setCurrentArea(null);
  }

  const S = {
    sidebar: { width:220, background:"#1a1a1a", color:"#fff", padding:"24px 0", display:"flex" as const, flexDirection:"column" as const },
    main: { flex:1, background:"#f9f9f9", padding:32, overflowY:"auto" as const },
    card: { background:"#fff", borderRadius:12, padding:24, marginBottom:20, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
    title: { fontSize:24, fontWeight:700, marginBottom:24 },
    input: { padding:"10px 14px", borderRadius:6, border:"1px solid #e5e5e5", fontSize:14, width:"100%", marginBottom:12, boxSizing:"border-box" as const },
    btn: { padding:"10px 24px", border:"none", borderRadius:6, cursor:"pointer", fontSize:14, fontWeight:600 },
    btnGold: { background:"#c8a96e", color:"#000" },
    btnRed: { background:"#fee2e2", color:"#dc2626", padding:"6px 16px" },
    btnGray: { background:"#f0f0f0", color:"#333" },
    label: { fontSize:13, color:"#666", marginBottom:6, display:"block" as const },
    row: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  };

  if (!mounted) return <div style={{padding:32}}>Loading...</div>;

  return (
    <div style={{display:"flex", minHeight:"100vh", fontFamily:"Inter,sans-serif"}}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={{padding:"0 24px 24px", fontSize:20, fontWeight:700, borderBottom:"1px solid #333"}}>
          Gift<span style={{color:"#c8a96e"}}>Luxe</span> Admin
        </div>
        <div style={{padding:"16px 0", flex:1}}>
          {["dashboard","categories","products","homepage"].map(s => (
            <span key={s} onClick={() => { setSection(s); setShowAddProduct(false); }} style={{display:"block", padding:"12px 24px", cursor:"pointer", color:section===s?"#c8a96e":"#aaa", background:section===s?"#c8a96e22":"transparent", borderLeft:section===s?"3px solid #c8a96e":"3px solid transparent", fontSize:14, textTransform:"capitalize"}}>
              {s}
            </span>
          ))}
        </div>
        <div style={{padding:24}}>
          <button onClick={() => window.open("/","_blank")} style={{...S.btn, ...S.btnGold, width:"100%"}}>View Site</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>

        {/* DASHBOARD */}
        {section === "dashboard" && (
          <div>
            <div style={S.title}>Dashboard</div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20}}>
              {[{label:"Categories",value:categories.length,color:"#c8a96e"},{label:"Products",value:products.length,color:"#4f6ef7"},{label:"Orders",value:0,color:"#4faf6e"}].map(s => (
                <div key={s.label} style={S.card}>
                  <div style={{fontSize:36, fontWeight:800, color:s.color}}>{s.value}</div>
                  <div style={{fontSize:14, color:"#888", marginTop:4}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {section === "categories" && (
          <div>
            <div style={S.title}>Categories</div>
            <div style={S.card}>
              <div style={{fontSize:16, fontWeight:600, marginBottom:16}}>Add New Category</div>
              <input placeholder="Category name" style={S.input} id="catname" />
              <button onClick={async () => {
                const input = document.getElementById("catname") as HTMLInputElement;
                if (!input.value.trim()) return;
                const supabase = getSupabase();
                await supabase.from("categories").insert({ name: input.value, slug: input.value.toLowerCase().replace(/\s+/g,"-") });
                input.value = "";
                loadAll();
              }} style={{...S.btn, ...S.btnGold}}>Add Category</button>
            </div>
            <div style={S.card}>
              {categories.length === 0 && <div style={{color:"#888", textAlign:"center", padding:32}}>No categories yet</div>}
              {categories.map(cat => (
                <div key={cat.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #f0f0f0"}}>
                  <span style={{fontWeight:500}}>{cat.name}</span>
                  <button onClick={async () => { const supabase = getSupabase(); await supabase.from("categories").delete().eq("id",cat.id); loadAll(); }} style={{...S.btn, ...S.btnRed}}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {section === "products" && !showAddProduct && (
          <div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24}}>
              <div style={S.title}>Products</div>
              <button onClick={() => setShowAddProduct(true)} style={{...S.btn, ...S.btnGold}}>+ Add Product</button>
            </div>
            <div style={S.card}>
              {products.length === 0 && <div style={{color:"#888", textAlign:"center", padding:32}}>No products yet. Click Add Product to start.</div>}
              {products.map(p => (
                <div key={p.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #f0f0f0"}}>
                  <div>
                    <div style={{fontWeight:600}}>{p.name}</div>
                    <div style={{fontSize:12, color:"#888"}}>{p.categories?.name || "No category"} • ${p.base_price}</div>
                  </div>
                  <button onClick={() => deleteProduct(p.id)} style={{...S.btn, ...S.btnRed}}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD PRODUCT FORM */}
        {section === "products" && showAddProduct && (
          <div>
            <div style={{display:"flex", alignItems:"center", gap:16, marginBottom:24}}>
              <button onClick={() => setShowAddProduct(false)} style={{...S.btn, ...S.btnGray}}>← Back</button>
              <div style={S.title}>Add New Product</div>
            </div>

            {/* Basic Info */}
            <div style={S.card}>
              <div style={{fontSize:16, fontWeight:600, marginBottom:16}}>Basic Info</div>
              <div style={S.row}>
                <div>
                  <label style={S.label}>Product Name *</label>
                  <input style={S.input} value={newProduct.name} onChange={e => setNewProduct(p=>({...p,name:e.target.value}))} placeholder="e.g. Premium Hoodie" />
                </div>
                <div>
                  <label style={S.label}>Base Price *</label>
                  <input style={S.input} value={newProduct.base_price} onChange={e => setNewProduct(p=>({...p,base_price:e.target.value}))} placeholder="0.00" type="number" />
                </div>
              </div>
              <label style={S.label}>Description</label>
              <textarea style={{...S.input, height:80, resize:"vertical"}} value={newProduct.description} onChange={e => setNewProduct(p=>({...p,description:e.target.value}))} placeholder="Product description..." />
              <label style={S.label}>Category</label>
              <select style={S.input} value={newProduct.category_id} onChange={e => setNewProduct(p=>({...p,category_id:e.target.value}))}>
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Images */}
            <div style={S.card}>
              <div style={{fontSize:16, fontWeight:600, marginBottom:16}}>Product Images (up to 5)</div>
              <input type="file" multiple accept="image/*" onChange={e => { if (e.target.files) setImages(Array.from(e.target.files).slice(0,5)); }} style={{marginBottom:12}} />
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {images.map((img, i) => (
                  <div key={i} style={{width:80, height:80, borderRadius:8, overflow:"hidden", border:"1px solid #e5e5e5"}}>
                    <img src={URL.createObjectURL(img)} style={{width:"100%", height:"100%", objectFit:"cover"}} />
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div style={S.card}>
              <div style={{fontSize:16, fontWeight:600, marginBottom:16}}>Variants (Colors & Sizes)</div>
              {variants.map((v, i) => (
                <div key={i} style={{display:"flex", gap:8, alignItems:"center", marginBottom:8}}>
                  <select value={v.type} onChange={e => { const nv=[...variants]; nv[i].type=e.target.value; setVariants(nv); }} style={{...S.input, width:120, marginBottom:0}}>
                    <option value="color">Color</option>
                    <option value="size">Size</option>
                  </select>
                  <input value={v.values} onChange={e => { const nv=[...variants]; nv[i].values=e.target.value; setVariants(nv); }} placeholder="e.g. Red, Blue, Green" style={{...S.input, flex:1, marginBottom:0}} />
                  <button onClick={() => setVariants(variants.filter((_,j)=>j!==i))} style={{...S.btn, ...S.btnRed, padding:"10px 14px"}}>×</button>
                </div>
              ))}
              <button onClick={() => setVariants([...variants, {type:"color", values:""}])} style={{...S.btn, ...S.btnGray}}>+ Add Variant</button>
            </div>

            {/* Customization */}
            <div style={S.card}>
              <div style={{fontSize:16, fontWeight:600, marginBottom:16}}>Customization Settings</div>
              <div style={{display:"flex", gap:24, marginBottom:16}}>
                <label style={{display:"flex", alignItems:"center", gap:8, cursor:"pointer"}}>
                  <input type="checkbox" checked={newProduct.allow_logo} onChange={e => setNewProduct(p=>({...p,allow_logo:e.target.checked}))} />
                  <span style={{fontSize:14}}>Allow Logo Upload</span>
                </label>
                <label style={{display:"flex", alignItems:"center", gap:8, cursor:"pointer"}}>
                  <input type="checkbox" checked={newProduct.allow_text} onChange={e => setNewProduct(p=>({...p,allow_text:e.target.checked}))} />
                  <span style={{fontSize:14}}>Allow Text</span>
                </label>
              </div>
              {newProduct.allow_text && (
                <div style={{marginBottom:16}}>
                  <label style={S.label}>Max Characters</label>
                  <input type="number" value={newProduct.max_chars} onChange={e => setNewProduct(p=>({...p,max_chars:parseInt(e.target.value)}))} style={{...S.input, width:120}} />
                </div>
              )}

              {/* Fonts */}
              <div style={{marginBottom:16}}>
                <label style={S.label}>Available Fonts</label>
                <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:8}}>
                  {fonts.map((f,i) => (
                    <div key={i} style={{display:"flex", alignItems:"center", gap:4, background:"#f5f5f5", padding:"4px 10px", borderRadius:20, fontSize:13}}>
                      <span style={{fontFamily:f}}>{f}</span>
                      <span onClick={() => setFonts(fonts.filter((_,j)=>j!==i))} style={{cursor:"pointer", color:"#dc2626", fontWeight:700}}>×</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex", gap:8}}>
                  <input value={newFont} onChange={e => setNewFont(e.target.value)} placeholder="Font name (e.g. Roboto)" style={{...S.input, marginBottom:0, flex:1}} />
                  <button onClick={() => { if (newFont.trim()) { setFonts([...fonts, newFont.trim()]); setNewFont(""); } }} style={{...S.btn, ...S.btnGold}}>Add</button>
                </div>
              </div>

              {/* Text Colors */}
              <div>
                <label style={S.label}>Available Text Colors</label>
                <div style={{display:"flex", flexWrap:"wrap", gap:8, marginBottom:8}}>
                  {textColors.map((c,i) => (
                    <div key={i} style={{display:"flex", alignItems:"center", gap:4, background:"#f5f5f5", padding:"4px 10px", borderRadius:20, fontSize:13}}>
                      <div style={{width:14, height:14, borderRadius:"50%", background:c, border:"1px solid #ddd"}}></div>
                      <span>{c}</span>
                      <span onClick={() => setTextColors(textColors.filter((_,j)=>j!==i))} style={{cursor:"pointer", color:"#dc2626", fontWeight:700}}>×</span>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex", gap:8, alignItems:"center"}}>
                  <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} style={{width:40, height:36, border:"none", borderRadius:4, cursor:"pointer"}} />
                  <button onClick={() => { if (!textColors.includes(newColor)) setTextColors([...textColors, newColor]); }} style={{...S.btn, ...S.btnGold}}>Add Color</button>
                </div>
              </div>
            </div>

            {/* Print Area */}
            <div style={S.card}>
              <div style={{fontSize:16, fontWeight:600, marginBottom:8}}>Define Print Area</div>
              <div style={{fontSize:13, color:"#888", marginBottom:16}}>Upload a product image and draw the print area by clicking and dragging</div>
              <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) setPrintAreaImg(URL.createObjectURL(e.target.files[0])); }} style={{marginBottom:12}} />
              {printAreaImg && (
                <div>
                  <div ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} style={{position:"relative", width:"100%", maxWidth:400, cursor:"crosshair", userSelect:"none"}}>
                    <img src={printAreaImg} style={{width:"100%", display:"block", borderRadius:8}} draggable={false} />
                    {printAreas.map((area, i) => (
                      <div key={i} style={{position:"absolute", left:`${area.x}%`, top:`${area.y}%`, width:`${area.width}%`, height:`${area.height}%`, border:"2px solid #c8a96e", background:"rgba(200,169,110,0.2)", boxSizing:"border-box"}}>
                        <span style={{fontSize:10, background:"#c8a96e", color:"#000", padding:"1px 4px"}}>Area {i+1}</span>
                      </div>
                    ))}
                    {currentArea && (
                      <div style={{position:"absolute", left:`${currentArea.x}%`, top:`${currentArea.y}%`, width:`${currentArea.width}%`, height:`${currentArea.height}%`, border:"2px dashed #c8a96e", background:"rgba(200,169,110,0.1)", boxSizing:"border-box", pointerEvents:"none"}} />
                    )}
                  </div>
                  {printAreas.length > 0 && (
                    <div style={{marginTop:8}}>
                      <span style={{fontSize:13, color:"#666"}}>{printAreas.length} area(s) defined</span>
                      <button onClick={() => setPrintAreas([])} style={{...S.btn, ...S.btnRed, marginLeft:8, padding:"4px 12px", fontSize:12}}>Clear All</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save */}
            <div style={{display:"flex", gap:12}}>
              <button onClick={saveProduct} disabled={uploading} style={{...S.btn, ...S.btnGold, opacity:uploading?0.7:1}}>
                {uploading ? "Saving..." : "Save Product"}
              </button>
              <button onClick={() => setShowAddProduct(false)} style={{...S.btn, ...S.btnGray}}>Cancel</button>
            </div>
          </div>
        )}

        {/* HOMEPAGE */}
        {section === "homepage" && (
          <div>
            <div style={S.title}>Homepage Manager</div>
            <div style={S.card}>
              <p style={{color:"#888"}}>Coming soon — edit hero, banners, featured products</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}