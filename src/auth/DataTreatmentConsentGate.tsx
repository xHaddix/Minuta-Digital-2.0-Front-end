import { useState } from "react";
import { useAuth } from "./useAuth";
import { FormFeedback } from "../components/ui/FormFeedback";

interface DataTreatmentConsentGateProps {
  version: string;
  organizationName?: string | null;
  residentialComplexName?: string | null;
}

export function DataTreatmentConsentGate({
  version,
  organizationName,
  residentialComplexName,
}: DataTreatmentConsentGateProps) {
  const { acceptDataTreatmentConsent, logout } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const entityName =
    organizationName || residentialComplexName || "tu organización o conjunto";

  const handleAccept = async () => {
    if (!confirmed || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      await acceptDataTreatmentConsent(version);
    } catch {
      setError(
        "No pudimos registrar tu aceptación. Revisa tu conexión e inténtalo de nuevo.",
      );
      setSubmitting(false);
    }
  };

  return (
    <main className="data-treatment-page">
      <section
        className="data-treatment-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-treatment-title"
      >
        <span className="data-treatment-eyebrow">Antes de continuar</span>
        <h1 id="data-treatment-title">Tratamiento de tus datos personales</h1>
        <p className="data-treatment-intro">
          Queremos explicarte qué información usa Minuta Digital y para qué.
          Revisa este aviso antes de entrar a la plataforma.
        </p>

        <div className="data-treatment-details">
          <section>
            <h2>Entidad asociada a tu cuenta</h2>
            <p>{entityName}</p>
          </section>
          <section>
            <h2>Datos y finalidades</h2>
            <p>
              La plataforma puede tratar tus datos de identificación y
              contacto, unidad residencial, imagen de perfil y registros
              relacionados con las funciones que utilizas. Se usan para
              autenticar y administrar tu cuenta, gestionar residentes,
              visitantes, correspondencia y solicitudes, prestar soporte y
              proteger la seguridad y trazabilidad del servicio.
            </p>
          </section>
          <section>
            <h2>Tus derechos</h2>
            <p>
              Puedes solicitar acceso, actualización, rectificación o supresión
              de tus datos y revocar la autorización cuando proceda. Para
              hacerlo, contacta a la administración de {entityName}.
            </p>
          </section>
          <p className="data-treatment-version">
            Versión del aviso: {version}
          </p>
        </div>

        <label className="data-treatment-confirm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            disabled={submitting}
          />
          <span>
            Leí esta información y autorizo el tratamiento de mis datos para
            las finalidades descritas.
          </span>
        </label>

        {error ? <FormFeedback variant="error">{error}</FormFeedback> : null}

        <div className="data-treatment-actions">
          <button
            type="button"
            className="data-treatment-accept"
            onClick={() => void handleAccept()}
            disabled={!confirmed || submitting}
          >
            {submitting ? "Guardando aceptación..." : "Acepto y continuar"}
          </button>
          <button
            type="button"
            className="data-treatment-logout"
            onClick={logout}
            disabled={submitting}
          >
            No acepto, cerrar sesión
          </button>
        </div>
      </section>
    </main>
  );
}
