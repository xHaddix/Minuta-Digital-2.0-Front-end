import { CheckCircle2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AUTH_ENDPOINTS } from "../../config/app";
import api from "../../services/api";
import { AnimatedButton } from "../../components/ui/AnimatedButton";
import { FormFeedback } from "../../components/ui/FormFeedback";

interface ActivationResponse {
  message?: string;
}

export function ActivateAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState(
    "Define tu nueva contraseña para activar tu cuenta y continuar con seguridad.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useMemo(
    () =>
      searchParams.get("token") ?? searchParams.get("activationToken") ?? "",
    [searchParams],
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(
        "El enlace de activación no incluye un token válido. Solicita uno nuevo desde la opción de registro o recuperación.",
      );
    }
  }, [token]);

  const handleReturnToLogin = () => {
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage(
        "No se encontró un token válido para completar la activación.",
      );
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setStatus("error");
      setMessage(
        "Usa al menos una mayúscula y un número para fortalecer la contraseña.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Las contraseñas no coinciden. Verifica ambos campos.");
      return;
    }

    setStatus("loading");
    setIsSubmitting(true);
    setMessage("Activando tu cuenta y guardando la nueva contraseña...");

    try {
      const { data } = await api.post<ActivationResponse>(
        AUTH_ENDPOINTS.activate,
        {
          token,
          password,
        },
      );

      setStatus("success");
      setMessage(
        data.message ||
          "Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión de forma segura.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const responseMessage =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;

      setStatus("error");
      setMessage(
        responseMessage ||
          "Este enlace ya expiró, es inválido o fue usado previamente. Solicita una nueva activación.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestNewActivation = async () => {
    if (!token) {
      setStatus("error");
      setMessage(
        "No hay un token disponible para solicitar una nueva activación.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(AUTH_ENDPOINTS.resendActivation, { token });
      setStatus("success");
      setMessage(
        "Se ha enviado un nuevo enlace de activación a tu correo. Revisa la bandeja de entrada y spam.",
      );
    } catch {
      setStatus("error");
      setMessage(
        "No fue posible reenviar el enlace. Contacta al administrador o vuelve a intentarlo más tarde.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-view">
      <div className="login-grid login-grid--compact">
        <aside className="login-hero-panel login-hero-panel--compact">
          <div className="login-hero-brand">
            <div className="login-hero-mark">
              <ShieldCheck size={30} strokeWidth={1.8} />
            </div>
            <div className="login-hero-brand-name">
              <span>Minuta</span>
              <span>Digital</span>
            </div>
          </div>

          <div className="login-hero-body">
            <h1>Activación segura de la cuenta</h1>
            <p className="login-hero-copy">
              Verificamos la identidad del usuario antes de permitir acceso al
              sistema.
            </p>
          </div>

          <div className="login-hero-footer">
            <span className="login-hero-dot" />
            <span>Acceso protegido por validación</span>
          </div>
        </aside>

        <section className="login-center-panel login-center-panel--compact">
          <header className="login-center-header">
            <div className="login-center-mark">
              {status === "success" ? (
                <CheckCircle2 size={24} strokeWidth={1.8} />
              ) : (
                <TriangleAlert size={24} strokeWidth={1.8} />
              )}
            </div>
            <div className="login-center-brand-name">
              <span>Activación</span>
            </div>
          </header>

          <h2>
            {status === "success"
              ? "Cuenta activada"
              : status === "error"
                ? "No se pudo activar"
                : "Activación segura"}
          </h2>

          <p className="login-center-subtitle">{message}</p>

          <form onSubmit={handleSubmit} className="login-center-form">
            {status !== "success" ? (
              <>
                <div className="login-field login-password-field">
                  <span className="login-field-icon">◌</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nueva contraseña"
                    aria-label="Nueva contraseña"
                    disabled={isSubmitting}
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

                <div className="login-field login-password-field">
                  <span className="login-field-icon">◌</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirmar contraseña"
                    aria-label="Confirmar contraseña"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                  >
                    {showConfirmPassword ? "◉" : "◌"}
                  </button>
                </div>
              </>
            ) : null}

            {status === "success" ? (
              <FormFeedback variant="success">
                Tu acceso ya está listo. Puedes continuar e iniciar sesión con
                tus credenciales.
              </FormFeedback>
            ) : status === "error" ? (
              <FormFeedback variant="error">{message}</FormFeedback>
            ) : (
              <FormFeedback variant="info">
                Tu contraseña debe tener mínimo 8 caracteres, incluir al menos
                una mayúscula y un número.
              </FormFeedback>
            )}

            {status !== "success" ? (
              <AnimatedButton type="submit" loading={isSubmitting}>
                Activar cuenta
              </AnimatedButton>
            ) : (
              <AnimatedButton type="button" onClick={handleReturnToLogin}>
                Ir al inicio de sesión
              </AnimatedButton>
            )}

            {status === "error" ? (
              <button
                type="button"
                className="login-link-button"
                onClick={handleRequestNewActivation}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Solicitando..." : "Solicitar nueva activación"}
              </button>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
}
