import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_base")
    .select("*")
    .order("section");
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  const { section, title, content, active } = await req.json();
  const supabase = await createClient();

  const { error } = await supabase
    .from("knowledge_base")
    .upsert({ section, title: title ?? section, content, active: active ?? true }, { onConflict: "section" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
