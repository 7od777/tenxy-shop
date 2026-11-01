// ==========================================
// SUPABASE CLIENT CONFIGURATION (TENXY SHOP)
// ==========================================

// ใส่ค่าจาก Supabase Project Settings -> API
const SUPABASE_URL = "https://crhnsftvfosbwwxgtpzy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_aac1bEpm5cbk_PW5UN6EVQ_4RyCcUVx"; // public anon / publishable key

let supabaseClient = null;

// Initialize Supabase Client
if (typeof supabase !== 'undefined' && SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY") {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("⚡ Supabase connected successfully!");
  } catch (err) {
    console.warn("Supabase initialization error:", err);
  }
} else {
  console.info("ℹ️ Supabase credentials not set yet. Using fallback mock data.");
}

// 1. Fetch Products for TENXY SHOP
async function getProducts() {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // จัดอันดับสินค้า: เรียงตาม sort_order (1, 2, 3...) ถ้าไม่มีจะเรียงตาม id
    data.sort((a, b) => {
      const orderA = (a.sort_order !== null && a.sort_order !== undefined) ? Number(a.sort_order) : 99999;
      const orderB = (b.sort_order !== null && b.sort_order !== undefined) ? Number(b.sort_order) : 99999;
      if (orderA !== orderB) return orderA - orderB;
      return Number(a.id) - Number(b.id);
    });

    return data.map(p => ({
      id: p.id,
      n: p.name,
      b: p.brand || 'TENXY Sounds',
      c: p.category || 'Sample',
      k: p.kind || 'pack',
      p: Number(p.price),
      o: Number(p.original_price || p.price),
      s: Number(p.stock !== undefined ? p.stock : 99),
      img: p.image || null
    }));
  } catch (err) {
    console.error("Error fetching products from Supabase:", err);
    return null;
  }
}

// 2. Save Order to Supabase
async function createOrder(orderPayload) {
  if (!supabaseClient) return { success: true, simulated: true };
  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .insert([
        {
          items: orderPayload.items,
          total_amount: orderPayload.totalAmount,
          currency: 'LAK',
          status: 'pending'
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Error saving order:", err);
    return { success: false, error };
  }
}
