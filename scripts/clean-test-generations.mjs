import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://auwcncjkjnksidscilgr.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1d2NuY2pram5rc2lkc2NpbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NzAyMTYsImV4cCI6MjEwMzA0NjIxNn0.SOFTkIAEETh1OVEeV_CAydwc4UExAenaH_TkKLt0UdY";

const supabase = createClient(supabaseUrl, anonKey);

async function cleanAllGenerations() {
  console.log("=== CLEANING ALL OLD TEST GENERATIONS ===");
  const { data: before, error: countErr } = await supabase.from("generations").select("id, prompt, media_type");
  console.log("Current generations count:", before ? before.length : 0);
  if (before && before.length > 0) {
    console.log("Sample records:", before.map(b => `[${b.media_type}] ${b.prompt?.substring(0, 40)}`));
    
    // Delete all
    const { error: delErr } = await supabase.from("generations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (delErr) {
      console.log("Delete error with anon key (RLS):", delErr.message);
    } else {
      console.log("Successfully wiped all old test generations!");
    }
  }
}

cleanAllGenerations();
