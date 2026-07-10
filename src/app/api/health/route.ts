import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("_health_check").select("*").limit(1);

    // Errores que confirman que la BD está alcanzable (la tabla simplemente no existe)
    const tableNotFound =
      error?.code === "42P01" ||
      error?.message?.includes("does not exist") ||
      error?.message?.includes("schema cache");

    const connected = !error || tableNotFound;

    return NextResponse.json({
      status: connected ? "ok" : "error",
      database: connected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      ...(error && !connected && { error: error.message }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
