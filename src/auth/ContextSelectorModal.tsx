import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Building,
  Building2,
  ChevronLeft,
  X,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { Organization } from "../types/auth";
import type { ResidentialComplex } from "../types/user";
import { useAuth } from "./useAuth";
import {
  fetchOrganizations,
  fetchResidentialComplexes,
} from "../services/auth-context";

type Step = "ORGANIZATION" | "COMPLEX";
type SortOrder = "ASC" | "DESC";

interface ContextSelectorModalProps {
  onClose?: () => void;
}

export function ContextSelectorModal({ onClose }: ContextSelectorModalProps) {
  const navigate = useNavigate();
  const { session, switchComplex: performSwitchComplex } = useAuth();
  const roleCode = session?.user?.roleCode ?? null;
  const isDev = roleCode === "ROLE_DEV";
  const isOrgAdmin = roleCode === "ROLE_ORG_ADMIN";
  const isComplexAdmin = roleCode === "ROLE_COMPLEX_ADMIN";

  const [currentStep, setCurrentStep] = useState<Step>(
    isDev ? "ORGANIZATION" : "COMPLEX",
  );
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [complexes, setComplexes] = useState<ResidentialComplex[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("ASC");
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrganizations = async () => {
      if (!isDev) return;

      try {
        setIsLoading(true);
        setError("");
        const data = await fetchOrganizations();
        setOrganizations(data);
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
      if (isDev && !selectedOrganization) return;
      if (!isDev && !isOrgAdmin && !isComplexAdmin) return;

      try {
        setIsLoading(true);
        setError("");
        const data = await fetchResidentialComplexes(
          isDev ? selectedOrganization?.id : undefined,
        );
        setComplexes(data);
      } catch {
        setError("No fue posible cargar los conjuntos residenciales.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadComplexes();
  }, [isComplexAdmin, isDev, isOrgAdmin, selectedOrganization]);

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    setSearchTerm("");
    setCurrentStep("COMPLEX");
  };

  const handleSelectComplex = async (
    complexId: string,
    complexName: string,
  ) => {
    try {
      setIsSwitching(true);
      setError("");
      await performSwitchComplex(complexId, {
        organizationName: selectedOrganization?.name,
        residentialComplexName: complexName,
      });
      onClose?.();
      navigate("/dashboard", { replace: true });
    } catch {
      setError("No fue posible conmutar al conjunto seleccionado.");
      setIsSwitching(false);
    }
  };

  const handleBackToOrganizations = () => {
    setSelectedOrganization(null);
    setComplexes([]);
    setSearchTerm("");
    setCurrentStep("ORGANIZATION");
  };

  // Mapeo corregido soportando 'urlLogo' (servidor) y 'logoUrl' (fallback)
  const activeItems = useMemo(() => {
    const rawList =
      currentStep === "ORGANIZATION"
        ? organizations.map((o) => ({
            id: o.id,
            name: o.name,
            logo: o.urlLogo ?? o.logoUrl ?? null,
          }))
        : complexes.map((c) => ({
            id: c.id,
            name: c.name,
            logo: c.urlLogo ?? c.logoUrl ?? null,
          }));

    const filtered = rawList.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
    );

    return filtered.sort((a, b) => {
      if (sortOrder === "ASC") {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });
  }, [currentStep, organizations, complexes, searchTerm, sortOrder]);

  return (
    <div className="context-modal-backdrop">
      <div className="context-modal-card context-modal-card--wide">
        <div className="context-modal-header">
          <div className="context-modal-title-group">
            {currentStep === "COMPLEX" && isDev && (
              <button
                type="button"
                className="context-back-button"
                onClick={handleBackToOrganizations}
                disabled={isSwitching}
                title="Volver a Organizaciones"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="context-modal-icon">
              <Building2 size={24} strokeWidth={1.8} />
            </div>
            <div>
              <h2>
                {currentStep === "ORGANIZATION"
                  ? "Selecciona la Organización"
                  : "Selecciona el Conjunto Residencial"}
              </h2>
              {selectedOrganization && (
                <span className="context-subtitle">
                  Organización activa:{" "}
                  <strong>{selectedOrganization.name}</strong>
                </span>
              )}
            </div>
          </div>
          {onClose ? (
            <button
              type="button"
              className="context-close-button"
              onClick={onClose}
              disabled={isSwitching}
              aria-label="Cerrar selector de contexto"
              title="Cerrar"
            >
              <X size={20} />
            </button>
          ) : null}
        </div>

        <div className="context-controls-bar">
          <div className="context-search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="context-search-input"
              placeholder={
                currentStep === "ORGANIZATION"
                  ? "Buscar organización..."
                  : "Buscar conjunto residencial..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading || isSwitching}
            />
          </div>

          <button
            type="button"
            className="context-sort-button"
            onClick={() =>
              setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"))
            }
            title="Cambiar orden"
          >
            {sortOrder === "ASC" ? (
              <>
                <ArrowDownAZ size={18} />
                <span>Orden: A-Z</span>
              </>
            ) : (
              <>
                <ArrowUpAZ size={18} />
                <span>Orden: Z-A</span>
              </>
            )}
          </button>
        </div>

        <div className="context-counter-label">
          {isLoading
            ? "Cargando opciones..."
            : `${activeItems.length} ${
                currentStep === "ORGANIZATION" ? "organizaciones" : "conjuntos"
              } disponibles`}
        </div>

        {error ? <div className="context-modal-error">{error}</div> : null}

        <div className="context-cards-grid">
          {isLoading || isSwitching ? (
            <div className="context-grid-state">
              <div className="auth-transition-spinner" />
              <span>
                {isSwitching
                  ? "Conmutando de conjunto y re-firmando token..."
                  : "Cargando catálogo..."}
              </span>
            </div>
          ) : activeItems.length === 0 ? (
            <div className="context-grid-state">
              <span>No se encontraron resultados para la búsqueda.</span>
            </div>
          ) : (
            activeItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="context-entity-card"
                onClick={() =>
                  currentStep === "ORGANIZATION"
                    ? handleSelectOrganization({
                        id: item.id,
                        name: item.name,
                      })
                    : handleSelectComplex(item.id, item.name)
                }
              >
                <div className="entity-card-media">
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} />
                  ) : (
                    <div className="entity-card-placeholder">
                      {currentStep === "ORGANIZATION" ? (
                        <Building size={32} />
                      ) : (
                        <Building2 size={32} />
                      )}
                    </div>
                  )}
                </div>
                <div className="entity-card-footer">
                  <span className="entity-card-title">{item.name}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="context-modal-footer">
          <ShieldCheck size={16} />
          <span>
            Tu token JWT se refrendará al seleccionar una sede para aplicar el
            aislamiento de datos.
          </span>
        </div>
      </div>
    </div>
  );
}
