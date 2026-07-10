import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processQueue } from "@/lib/queue/processor";

export async function GET(req: NextRequest) {
  // Verificar token de seguridad
  const token = req.nextUrl.searchParams.get("token");
  if (process.env.CRON_SECRET && token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const result = await processQueue(supabase);

  return NextResponse.json({ ok: true, ...result });
}
