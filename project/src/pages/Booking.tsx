import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateTimeSlots, TimeSlot } from '../lib/timeSlots';
// Página para criação de novos agendamentos
interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
}
// Componente principal da página de agendamento
export function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfDay(new Date()), 1));
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadServices();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedService, selectedDate]);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao carregar serviços:', error);
    } else {
      setServices(data || []);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedService) return;

    const dayStart = startOfDay(selectedDate);
    const dayEnd = addDays(dayStart, 1);

    const { data, error } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .gte('start_time', dayStart.toISOString())
      .lt('start_time', dayEnd.toISOString())
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Erro ao carregar agendamentos:', error);
      return;
    }

    const slots = generateTimeSlots(selectedDate, selectedService.duration_minutes, data || []);
    setAvailableSlots(slots);
    setSelectedSlot(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedService || !selectedSlot) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          client_id: user.id,
          service_id: selectedService.id,
          start_time: selectedSlot.start.toISOString(),
          end_time: selectedSlot.end.toISOString(),
          notes: notes || null,
          status: 'pending'
        });

      if (error) throw error;

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getNextDays = (count: number) => {
    const days = [];
    for (let i = 1; i <= count; i++) {
      days.push(addDays(startOfDay(new Date()), i));
    }
    return days;
  };

  return (
    <div className="booking-page">
      <header className="booking-header">
        <h1>Novo Agendamento</h1>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Voltar
        </button>
      </header>

      <main className="booking-content">
        <form onSubmit={handleSubmit} className="booking-form">
          <section className="form-section">
            <h2>1. Escolha o Serviço</h2>
            <div className="services-grid">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(service)}
                >
                  <h3>{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-info">
                    <span className="duration">{service.duration_minutes} min</span>
                    <span className="price">R$ {service.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {selectedService && (
            <section className="form-section">
              <h2>2. Escolha a Data</h2>
              <div className="dates-grid">
                {getNextDays(7).map((date) => (
                  <button
                    key={date.toISOString()}
                    type="button"
                    className={`date-button ${selectedDate.toDateString() === date.toDateString() ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="day-name">
                      {format(date, 'EEE', { locale: ptBR })}
                    </span>
                    <span className="day-number">
                      {format(date, 'dd', { locale: ptBR })}
                    </span>
                    <span className="month-name">
                      {format(date, 'MMM', { locale: ptBR })}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedService && selectedDate && (
            <section className="form-section">
              <h2>3. Escolha o Horário</h2>
              <div className="slots-grid">
                {availableSlots.length === 0 ? (
                  <p className="no-slots">Nenhum horário disponível para esta data.</p>
                ) : (
                  availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`slot-button ${!slot.available ? 'unavailable' : ''} ${selectedSlot === slot ? 'selected' : ''}`}
                      onClick={() => slot.available && setSelectedSlot(slot)}
                      disabled={!slot.available}
                    >
                      {format(slot.start, 'HH:mm')}
                    </button>
                  ))
                )}
              </div>
            </section>
          )}

          {selectedSlot && (
            <section className="form-section">
              <h2>4. Observações (Opcional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Alguma observação especial? Dores específicas? Preferências?"
                rows={4}
                className="notes-textarea"
              />
            </section>
          )}

          {error && <div className="error-message">{error}</div>}

          {selectedSlot && (
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          )}
        </form>
      </main>
    </div>
  );
}
