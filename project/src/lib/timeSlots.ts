import { addMinutes, setHours, setMinutes, startOfDay, isAfter, isBefore, parseISO } from 'date-fns';
// Gera intervalos de tempo disponíveis para agendamentos
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

const BUSINESS_HOURS = {
  start: 9,
  end: 18,
};

export function generateTimeSlots(
  date: Date,
  durationMinutes: number,
  existingAppointments: Array<{ start_time: string; end_time: string }>
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  let currentTime = setMinutes(setHours(startOfDay(date), BUSINESS_HOURS.start), 0);
  const endOfDay = setMinutes(setHours(startOfDay(date), BUSINESS_HOURS.end), 0);

  while (isBefore(currentTime, endOfDay)) {
    const slotEnd = addMinutes(currentTime, durationMinutes);

    if (isAfter(slotEnd, endOfDay)) {
      break;
    }

    const isAvailable = !existingAppointments.some(appointment => {
      const appointmentStart = parseISO(appointment.start_time);
      const appointmentEnd = parseISO(appointment.end_time);

      return (
        (isAfter(currentTime, appointmentStart) && isBefore(currentTime, appointmentEnd)) ||
        (isAfter(slotEnd, appointmentStart) && isBefore(slotEnd, appointmentEnd)) ||
        (isBefore(currentTime, appointmentStart) && isAfter(slotEnd, appointmentEnd))
      );
    });

    slots.push({
      start: currentTime,
      end: slotEnd,
      available: isAvailable,
    });

    currentTime = slotEnd;
  }

  return slots;
}
