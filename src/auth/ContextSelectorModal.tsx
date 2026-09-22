import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ShieldCheck } from "lucide-react";
import type { Organization, ResidentialComplex } from "../types/auth";
import { useAuth } from "./useAuth";
import {
  fetchOrganizations,
  fetchResidentialComplexes,
} from "../services/auth-context";

export function ContextSelectorModal() {
  const navigate = useNavigate();
  const { session, switchComplex: performSwitchComplex } = useAuth();
  const roleCode = session?.user?.roleCode ?? null;
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [complexes, setComplexes] = useState<ResidentialComplex[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [selectedComplexId, setSelectedComplexId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isDev = roleCode === "ROLE_DEV";
  const isOrgAdmin = roleCode === "ROLE_ORG_ADMIN";

  const canShowOrganizationSelector = useMemo(() => isDev, [isDev]);

  useEffect(() => {
    const loadOrganizations = async () => {
      if (!isDev) return;

      try {
        setIsLoading(true);
        const nextOrganizations = await fetchOrganizations();
        setOrganizations(nextOrganizations);
      } catch {
        setError("No fue posible cargar las organizaciones disponibles.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrganizations();
  }, [isDev]);

  useEffect(() => {
    const loadComplexes = async () => {
      try {
        setIsLoading(true);
        const nextComplexes = await fetchResidentialComplexes(
          canShowOrganizationSelector ? selectedOrganizationId : null,
        );

        setComplexes(nextComplexes);
        if (nextComplexes.length > 0) {
          setSelectedComplexId(nextComplexes[0].id);
        } else {
          setSelectedComplexId("");
        }
      } catch {
        setError("No fue posible cargar los conjuntos residenciales.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOrgAdmin || (isDev && selectedOrganizationId)) {
      void loadComplexes();
    }
  }, [canShowOrganizationSelector, isDev, isOrgAdmin, selectedOrganizationId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedComplexId) {
      setError("Selecciona un conjunto residencial antes de continuar.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await performSwitchComplex(selectedComplexId);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("No fue posible actualizar el contexto del conjunto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="context-modal-backdrop">
      <div className="context-modal-card">
        <div className="context-modal-header">
          <div className="context-modal-icon">
            <Building2 size={24} strokeWidth={1.8} />
          </div>
          <div>
            <p className="context-modal-label">Selecciona el contexto</p>
            <h2>Conjunto residencial</h2>
          </div>
        </div>

        <p className="context-modal-copy">
          Tu perfil requiere elegir el conjunto activo para continuar con la
          operación del sistema.
        </p>

        <form className="context-modal-form" onSubmit={handleSubmit}>
          {canShowOrganizationSelector ? (
            <label className="context-select-field">
              <span>Organización</span>
              <select
                value={selectedOrganizationId}
                onChange={(event) =>
                  setSelectedOrganizationId(event.target.value)
                }
                disabled={isLoading || organizations.length === 0}
              >
                <option value="">Selecciona una organización</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="context-select-field">
            <span>Conjunto residencial</span>
            <select
              value={selectedComplexId}
              onChange={(event) => setSelectedComplexId(event.target.value)}
              disabled={isLoading || complexes.length === 0}
            >
              <option value="">Selecciona un conjunto</option>
              {complexes.map((complex) => (
                <option key={complex.id} value={complex.id}>
                  {complex.name}
                </option>
              ))}
            </select>
          </label>

          {error ? <div className="context-modal-error">{error}</div> : null}

          <button
            className="context-modal-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Continuar"}
          </button>
        </form>

        <div className="context-modal-footer">
          <ShieldCheck size={16} />
          <span>
            Tu acceso se reconfigura según el conjunto seleccionado y la firma
            del token.
          </span>
        </div>
      </div>
    </div>
  );
}
