import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("agent_config")
    .select("id")
    .single();

  if (!current) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("agent_config")
    .update({
      clinic_name: body.clinic_name,
      system_prompt: body.system_prompt,
      model: body.model,
      enabled: body.enabled,
      auto_reply: body.auto_reply,
    })
    .eq("id", current.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
