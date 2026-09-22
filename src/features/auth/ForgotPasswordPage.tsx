import axios from "axios";
import { Building2, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AUTH_ENDPOINTS } from "../../config/app";
import { AnimatedButton } from "../../components/ui/AnimatedButton";
import { FormFeedback } from "../../components/ui/FormFeedback";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Ingresa tu correo electrónico para recuperar acceso.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError("El correo electrónico no tiene un formato válido.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(AUTH_ENDPOINTS.forgotPassword, {
        email: trimmedEmail,
      });

      const successMessage =
        typeof data?.message === "string"
          ? data.message
          : "Si existe una cuenta asociada a este correo, te enviaremos un enlace de recuperación.";

      setSuccess(successMessage);
      setTimeout(() => navigate("/login", { replace: true }), 1600);
    } catch (requestError) {
      const responseMessage = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;

      const fallbackMessage =
        "No se pudo enviar la solicitud. Intenta nuevamente.";
      const message = Array.isArray(responseMessage)
        ? responseMessage[0]
        : responseMessage || fallbackMessage;

      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-view">
      <div className="login-grid login-grid--compact">
        <aside className="login-hero-panel login-hero-panel--compact">
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
            <h1>Recupera el acceso a tu cuenta</h1>
            <p className="login-hero-copy">
              Te ayudaremos a restablecer tu contraseña con instrucciones
              rápidas y seguras.
            </p>
          </div>

          <div className="login-hero-footer">
            <span className="login-hero-dot" />
            <span>Seguridad para tu comunidad</span>
          </div>
        </aside>

        <section className="login-center-panel login-center-panel--compact">
          <header className="login-center-header">
            <div className="login-center-mark">
              <Building2 size={26} strokeWidth={1.8} />
            </div>
            <div className="login-center-brand-name">
              <span>Minuta</span>
              <span>Digital</span>
            </div>
          </header>

          <h2>¿Olvidaste tu contraseña?</h2>
          <p className="login-center-subtitle">
            Ingresa tu correo electrónico y te enviaremos un enlace de
            recuperación.
          </p>

          <form onSubmit={handleSubmit} className="login-center-form">
            <label className="login-field">
              <span className="login-field-icon">
                <Mail size={17} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tucorreo@ejemplo.com"
                aria-label="Correo electrónico"
              />
            </label>

            {error ? (
              <FormFeedback variant="error">{error}</FormFeedback>
            ) : null}
            {success ? (
              <FormFeedback variant="success">{success}</FormFeedback>
            ) : null}

            <AnimatedButton type="submit" loading={loading}>
              Enviar enlace de recuperación
            </AnimatedButton>

            <Link
              to="/login"
              className="login-return-link login-return-link--inline"
            >
              ← Volver al inicio de sesión
            </Link>
          </form>
        </section>
      </div>
    </div>
  );
}
