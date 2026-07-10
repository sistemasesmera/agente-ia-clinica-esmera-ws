import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createClient();

  const { error } = await supabase.from("services").insert({
    name: body.name,
    description: body.description || null,
    duration_minutes: body.duration_minutes ?? 60,
    price: body.price ?? null,
    active: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
