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
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState(
    "Validando tu enlace seguro de activación...",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useMemo(
    () =>
      searchParams.get("token") ?? searchParams.get("activationToken") ?? "",
    [searchParams],
  );

  useEffect(() => {
    let isMounted = true;

    const validateAccount = async () => {
      if (!token) {
        if (isMounted) {
          setStatus("error");
          setMessage(
            "El enlace de activación no incluye un token válido. Solicita uno nuevo desde la opción de registro o recuperación.",
          );
        }
        return;
      }

      try {
        const { data } = await api.post<ActivationResponse>(
          AUTH_ENDPOINTS.activate,
          {
            token,
          },
        );

        if (isMounted) {
          setStatus("success");
          setMessage(
            data.message ||
              "Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión de forma segura.",
          );
        }
      } catch (error: unknown) {
        if (!isMounted) return;

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
      }
    };

    void validateAccount();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleReturnToLogin = () => {
    navigate("/login", { replace: true });
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
                : "Verificando enlace"}
          </h2>

          <p className="login-center-subtitle">{message}</p>

          <div className="login-center-form">
            {status === "success" ? (
              <FormFeedback variant="success">
                Tu acceso ya está listo. Puedes continuar e iniciar sesión con
                tus credenciales.
              </FormFeedback>
            ) : status === "error" ? (
              <FormFeedback variant="error">
                El enlace no es válido o ya fue utilizado. Solicita una nueva
                activación para continuar con seguridad.
              </FormFeedback>
            ) : (
              <FormFeedback variant="info">
                Estamos validando la firma del enlace y el estado de la cuenta.
              </FormFeedback>
            )}

            <div className="activation-actions">
              <AnimatedButton type="button" onClick={handleReturnToLogin}>
                Ir al inicio de sesión
              </AnimatedButton>

              {status === "error" ? (
                <button
                  type="button"
                  className="login-link-button"
                  onClick={handleRequestNewActivation}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Solicitando..."
                    : "Solicitar nueva activación"}
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
