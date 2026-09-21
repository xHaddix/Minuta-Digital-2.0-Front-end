import axios from "axios";
import { useState } from "react";
import type { FormEvent } from "react";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { AnimatedButton } from "../../components/ui/AnimatedButton";
import { FormFeedback } from "../../components/ui/FormFeedback";

const features = [
  "Registro de visitantes",
  "Control de paquetería",
  "Gestión de usuarios",
  "PQRS y solicitudes",
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@demo.minutadigital.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Debes ingresar tu correo y tu contraseña.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("El correo electrónico no tiene un formato válido.");
      return;
    }

    setLoading(true);

    try {
      await login(trimmedEmail, trimmedPassword);
      navigate("/dashboard");
    } catch (caughtError) {
      const responseMessage = axios.isAxiosError(caughtError)
        ? caughtError.response?.data?.message
        : undefined;

      const normalizedMessage = Array.isArray(responseMessage)
        ? responseMessage[0]
        : responseMessage;

      setError(
        normalizedMessage || "Credenciales inválidas o error del servidor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-view">
      <div className="login-grid">
        <aside className="login-hero-panel">
          <div className="login-hero-brand">
            <div className="login-hero-mark">
              <Building2 size={30} strokeWidth={1.8} />
            </div>
            <div className="login-hero-brand-name">
              <span>Minuta</span>
              <span>Digital</span>
            </div>
          </div>

          <div className="login-hero-body">
            <h1>Control de acceso inteligente para tu conjunto residencial</h1>

            <ul className="login-hero-features">
              {features.map((feature) => (
                <li key={feature} className="login-hero-feature-item">
                  <span className="login-hero-feature-icon">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="login-hero-footer">
            <span className="login-hero-dot" />
            <span>Tu seguridad, nuestra prioridad</span>
          </div>
        </aside>

        <section className="login-center-panel">
          <header className="login-center-header">
            <div className="login-center-mark">
              <Building2 size={26} strokeWidth={1.8} />
            </div>
            <div className="login-center-brand-name">
              <span>Minuta</span>
              <span>Digital</span>
            </div>
          </header>

          <h2>Inicia sesión en tu cuenta</h2>
          <p className="login-center-subtitle">
            Accede al panel de administración de tu conjunto.
          </p>

          <form onSubmit={handleSubmit} className="login-center-form">
            <label className="login-field">
              <span className="login-field-icon">✉</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo.minutadigital.com"
              />
            </label>

            <div className="login-field login-password-field">
              <span className="login-field-icon">🔑︎</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                aria-label="Contraseña"
              />
              <button
                type="button"
                className="login-password-toggle"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "◉" : "◌"}
              </button>
            </div>

            <div className="login-row">
              <label className="login-check">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>

              <button
                type="button"
                className="login-link-button"
                onClick={() => navigate("/forgot-password")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error ? (
              <FormFeedback variant="error">{error}</FormFeedback>
            ) : null}

            <AnimatedButton type="submit" loading={loading}>
              Iniciar sesión →
            </AnimatedButton>
          </form>
        </section>
      </div>
    </div>
  );
}
