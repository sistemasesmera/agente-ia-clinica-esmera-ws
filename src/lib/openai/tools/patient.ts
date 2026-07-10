interface SavePatientArgs {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

interface ToolContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  chatwootContactId?: number;
}

export async function savePatientInfo(
  args: SavePatientArgs,
  ctx: ToolContext
): Promise<string> {
  const { supabase, chatwootContactId } = ctx;

  await supabase.from("patients").upsert(
    {
      name: args.name,
      phone: args.phone,
      email: args.email ?? null,
      notes: args.notes ?? null,
      chatwoot_contact_id: chatwootContactId ?? null,
    },
    { onConflict: "phone" }
  );

  return `Información del paciente ${args.name} guardada correctamente.`;
}
