import { CheckCircle2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AUTH_ENDPOINTS } from "../../config/app";
import api from "../../services/api";
import { AnimatedButton } from "../../components/ui/AnimatedButton";
import { FormFeedback } from "../../components/ui/FormFeedback";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState(
    "Define tu nueva contraseña para continuar con tu acceso.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tokenFromUrl = useMemo(
    () => searchParams.get("token") ?? searchParams.get("resetToken") ?? "",
    [searchParams],
  );

  useEffect(() => {
    setToken(tokenFromUrl);
    if (!tokenFromUrl) {
      setStatus("error");
      setMessage(
        "El enlace para cambiar la contraseña no es válido o ya expiró. Solicita uno nuevo desde recuperar contraseña.",
      );
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage(
        "No se encontró un token válido para restablecer la contraseña.",
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
    setMessage("Actualizando tu contraseña de forma segura...");

    try {
      await api.post(AUTH_ENDPOINTS.resetPassword, {
        token,
        password,
      });

      setStatus("success");
      setMessage(
        "Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión con la nueva credencial.",
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
          "No fue posible cambiar la contraseña. El enlace puede haber expirado o ya haber sido usado.",
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
            <h1>Crea tu nueva contraseña</h1>
            <p className="login-hero-copy">
              Recomendamos usar una contraseña única y con una combinación de
              letras, números y mayúsculas.
            </p>
          </div>

          <div className="login-hero-footer">
            <span className="login-hero-dot" />
            <span>Protección reforzada</span>
          </div>
        </aside>

        <section className="login-center-panel login-center-panel--compact">
          <header className="login-center-header">
            <div className="login-center-mark">
              {status === "success" ? (
                <CheckCircle2 size={24} strokeWidth={1.8} />
              ) : status === "error" ? (
                <TriangleAlert size={24} strokeWidth={1.8} />
              ) : (
                <ShieldCheck size={24} strokeWidth={1.8} />
              )}
            </div>
            <div className="login-center-brand-name">
              <span>Seguridad</span>
            </div>
          </header>

          <h2>
            {status === "success"
              ? "Contraseña actualizada"
              : status === "error"
                ? "No se pudo cambiar"
                : "Restablecer contraseña"}
          </h2>

          <p className="login-center-subtitle">{message}</p>

          <form onSubmit={handleSubmit} className="login-center-form">
            <label className="login-field">
              <span className="login-field-icon">◌</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nueva contraseña"
                aria-label="Nueva contraseña"
                disabled={status === "success" || isSubmitting}
              />
            </label>

            <label className="login-field">
              <span className="login-field-icon">◌</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirmar contraseña"
                aria-label="Confirmar contraseña"
                disabled={status === "success" || isSubmitting}
              />
            </label>

            {status === "error" ? (
              <FormFeedback variant="error">{message}</FormFeedback>
            ) : status === "success" ? (
              <FormFeedback variant="success">{message}</FormFeedback>
            ) : (
              <FormFeedback variant="info">
                Tu contraseña debe tener mínimo 8 caracteres, incluyendo una
                mayúscula y un número.
              </FormFeedback>
            )}

            {status !== "success" ? (
              <AnimatedButton type="submit" loading={isSubmitting}>
                Cambiar contraseña
              </AnimatedButton>
            ) : (
              <AnimatedButton
                type="button"
                onClick={() => navigate("/login", { replace: true })}
              >
                Ir a iniciar sesión
              </AnimatedButton>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
