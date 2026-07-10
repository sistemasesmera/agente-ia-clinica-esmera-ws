interface CheckAvailabilityArgs {
  service_name: string;
  preferred_date?: string;
}

interface BookAppointmentArgs {
  patient_name: string;
  patient_phone: string;
  service_name: string;
  date: string;
  time: string;
  notes?: string;
}

interface ToolContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  conversationId: string;
  chatwootContactId?: number;
}

export async function checkAvailability(
  args: CheckAvailabilityArgs,
  ctx: ToolContext
): Promise<string> {
  const { supabase } = ctx;

  const targetDate = args.preferred_date
    ? new Date(args.preferred_date)
    : getNextWorkingDay();

  const dayOfWeek = targetDate.getDay();
  const dateStr = targetDate.toISOString().split("T")[0];

  // Obtener config de disponibilidad para ese día
  const { data: config } = await supabase
    .from("availability_config")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .eq("active", true)
    .single();

  if (!config) {
    return `Lo siento, no tenemos disponibilidad el ${formatDate(targetDate)}. ¿Te viene bien otro día?`;
  }

  // Generar todos los slots del día
  const slots = generateSlots(config.start_time, config.end_time, config.slot_duration_minutes);

  // Obtener citas ya reservadas ese día
  const { data: booked } = await supabase
    .from("appointments")
    .select("time")
    .eq("date", dateStr)
    .in("status", ["pending", "confirmed"]);

  const bookedTimes = new Set((booked ?? []).map((a: { time: string }) => a.time.slice(0, 5)));
  const freeSlots = slots.filter((s) => !bookedTimes.has(s));

  if (freeSlots.length === 0) {
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return `No hay disponibilidad el ${formatDate(targetDate)}. ¿Te viene bien el ${formatDate(nextDay)}?`;
  }

  const slotsText = freeSlots.slice(0, 6).join(", ");
  return `Para ${args.service_name} el ${formatDate(targetDate)} tenemos disponibilidad a las: ${slotsText}. ¿Cuál te va mejor?`;
}

export async function bookAppointment(
  args: BookAppointmentArgs,
  ctx: ToolContext
): Promise<string> {
  const { supabase, conversationId, chatwootContactId } = ctx;

  // Upsert paciente
  const { data: patient } = await supabase
    .from("patients")
    .upsert(
      {
        name: args.patient_name,
        phone: args.patient_phone,
        chatwoot_contact_id: chatwootContactId ?? null,
      },
      { onConflict: "phone" }
    )
    .select("id")
    .single();

  // Buscar servicio
  const { data: service } = await supabase
    .from("services")
    .select("id, name")
    .ilike("name", `%${args.service_name}%`)
    .eq("active", true)
    .single();

  // Verificar que el slot sigue libre
  const { data: existing } = await supabase
    .from("appointments")
    .select("id")
    .eq("date", args.date)
    .eq("time", args.time)
    .in("status", ["pending", "confirmed"])
    .single();

  if (existing) {
    return `Lo siento, ese horario acaba de ser reservado. ¿Quieres que busque otro slot disponible?`;
  }

  // Crear cita
  await supabase.from("appointments").insert({
    patient_id: patient?.id ?? null,
    service_id: service?.id ?? null,
    conversation_id: conversationId,
    date: args.date,
    time: args.time,
    status: "pending",
    notes: args.notes ?? null,
  });

  await supabase.from("agent_logs").insert({
    conversation_id: conversationId,
    event: "appointment_booked",
    payload: {
      patient: args.patient_name,
      service: args.service_name,
      date: args.date,
      time: args.time,
    },
  });

  const dateObj = new Date(`${args.date}T${args.time}`);
  return `¡Cita reservada! ${args.patient_name} — ${args.service_name} — ${formatDate(dateObj)} a las ${args.time}. Te enviaremos una confirmación. ¿Necesitas algo más?`;
}

// Helpers
function generateSlots(start: string, end: string, durationMinutes: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let current = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  while (current + durationMinutes <= endMinutes) {
    const h = Math.floor(current / 60).toString().padStart(2, "0");
    const m = (current % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    current += durationMinutes;
  }
  return slots;
}

function getNextWorkingDay(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}
