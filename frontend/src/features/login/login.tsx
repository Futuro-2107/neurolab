import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2, Atom, ShieldCheck, Activity, Cpu } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

// URL dinámica basada en las variables de entorno de Vite (Render / Local)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Correo o contraseña incorrectos.');
      }

      localStorage.setItem('access_token', data.access_token);
      onLoginSuccess(data.access_token);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      minHeight: '100vh',
      backgroundColor: '#070b16',
      fontFamily: "'DM Sans', sans-serif",
      overflow: 'hidden'
    }}>
      {/* Columna Izquierda: Información Corporativa y Estadísticas */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 80px',
        borderRight: '1px solid #1a2338',
        background: 'radial-gradient(circle at 10% 20%, rgba(37, 51, 94, 0.25) 0%, transparent 50%)'
      }}>
        <div>
          {/* Logo y Marca */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #657dfb, #8c74ff)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              boxShadow: '0 8px 20px rgba(100, 124, 255, 0.3)'
            }}>
              <Atom size={24} />
            </div>
            <div>
              <h3 style={{ font: '700 18px Space Grotesk, sans-serif', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                NeuroLab <span style={{ color: '#8c74ff', fontSize: '11px', letterSpacing: '1.5px', display: 'block' }}>ENTERPRISE</span>
              </h3>
            </div>
          </div>

          {/* Etiqueta de Versión */}
          <div style={{
            display: 'inline-block',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '1.2px',
            color: '#8598e9',
            background: '#151f38',
            border: '1px solid #283655',
            padding: '6px 12px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            PLATAFORMA CORPORATIVA v1.0
          </div>

          {/* Título Principal */}
          <h1 style={{
            font: '600 36px Space Grotesk, sans-serif',
            color: '#f0f3fc',
            lineHeight: 1.2,
            margin: '0 0 20px 0',
            letterSpacing: '-1px'
          }}>
            Plataforma de Investigación y <span style={{ color: '#9baeff' }}>Arquitectura Neuronal</span>
          </h1>

          <p style={{
            fontSize: '13px',
            color: '#8b96ad',
            lineHeight: 1.7,
            maxWidth: '480px',
            margin: 0
          }}>
            Supervisión en tiempo real de experimentos, gestión estructurada de datasets locales, diseño modular de redes y control seguro de accesos analíticos bajo arquitecturas escalables.
          </p>
        </div>

        {/* Métricas Inferiores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', marginTop: '40px' }}>
          <div>
            <div style={{ font: '600 24px Space Grotesk, sans-serif', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} style={{ color: '#718bff' }} /> 10 Módulos
            </div>
            <div style={{ fontSize: '11px', color: '#7886a0', marginTop: '4px' }}>Gestión completa y analítica</div>
          </div>
          <div>
            <div style={{ font: '600 24px Space Grotesk, sans-serif', color: '#4dd7a0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} style={{ color: '#4dd7a0' }} /> 24/7
            </div>
            <div style={{ fontSize: '11px', color: '#7886a0', marginTop: '4px' }}>Sincronización activa con DB</div>
          </div>
        </div>

        <div style={{ fontSize: '10px', color: '#525e75', marginTop: '30px' }}>
          © 2026 NeuroLab Enterprise. Todos los derechos reservados.
        </div>
      </div>

      {/* Columna Derecha: Formulario de Acceso */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#0b1020'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#11192b',
          border: '1px solid #222d43',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              margin: '0 auto 14px',
              borderRadius: '12px',
              background: '#1b2742',
              border: '1px solid #2f3e61',
              display: 'grid',
              placeItems: 'center',
              color: '#9baeff'
            }}>
              <ShieldCheck size={22} />
            </div>
            <h2 style={{ font: '600 20px Space Grotesk, sans-serif', color: '#e7ebf6', margin: '0 0 6px' }}>
              Iniciar Sesión
            </h2>
            <p style={{ fontSize: '11px', color: '#8b96ad', margin: 0 }}>
              Ingrese sus credenciales corporativas para continuar
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: '20px',
              backgroundColor: '#482632',
              border: '1px solid #693441',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#ffb3bc',
              fontSize: '11px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#aab6ce', marginBottom: '6px', letterSpacing: '0.5px' }}>
                CORREO ELECTRÓNICO
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7c8aa4' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0e1728',
                    border: '1px solid #2c3953',
                    borderRadius: '8px',
                    padding: '11px 12px 11px 38px',
                    color: '#dce4f6',
                    fontSize: '11px',
                    outline: 'none'
                  }}
                  placeholder="correo@neurolab.com"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '600', color: '#aab6ce', marginBottom: '6px', letterSpacing: '0.5px' }}>
                CONTRASEÑA
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7c8aa4' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0e1728',
                    border: '1px solid #2c3953',
                    borderRadius: '8px',
                    padding: '11px 12px 11px 38px',
                    color: '#dce4f6',
                    fontSize: '11px',
                    outline: 'none'
                  }}
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn"
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '12px',
                background: 'linear-gradient(135deg, #657dfb, #8c74ff)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(100, 124, 255, 0.25)'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <span>Ingresar a la Plataforma</span>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ fontSize: '10px', color: '#68758e' }}>
              NeuroLab Enterprise v1.0 • Acceso Restringido
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};