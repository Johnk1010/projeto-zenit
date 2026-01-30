import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// Página do painel de controle do usuário
interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  service: {
    name: string;
    duration_minutes: number;
  };
}
// Componente principal da página do painel de controle
export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadAppointments();
  }, [user, navigate]);

  const loadAppointments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        status,
        notes,
        service:services(name, duration_minutes)
      `)
      .eq('client_id', user.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Zenit</h1>
          <div className="header-actions">
            <button onClick={() => navigate('/booking')} className="primary-button">
              Novo Agendamento
            </button>
            <button onClick={handleSignOut} className="secondary-button">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Bem-vindo(a) de volta!</h2>
          <p>Gerencie seus agendamentos de massoterapia</p>
        </div>

        <section className="appointments-section">
          <h3>Seus Agendamentos</h3>

          {loading ? (
            <div className="loading">Carregando agendamentos...</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <p>Você ainda não tem agendamentos.</p>
              <button onClick={() => navigate('/booking')} className="primary-button">
                Agendar Primeira Sessão
              </button>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <h4>{appointment.service.name}</h4>
                    <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <div className="detail-row">
                      <span className="detail-label">Data:</span>
                      <span className="detail-value">
                        {format(new Date(appointment.start_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Horário:</span>
                      <span className="detail-value">
                        {format(new Date(appointment.start_time), 'HH:mm', { locale: ptBR })} - {format(new Date(appointment.end_time), 'HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Duração:</span>
                      <span className="detail-value">{appointment.service.duration_minutes} minutos</span>
                    </div>
                    {appointment.notes && (
                      <div className="detail-row">
                        <span className="detail-label">Observações:</span>
                        <span className="detail-value">{appointment.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
