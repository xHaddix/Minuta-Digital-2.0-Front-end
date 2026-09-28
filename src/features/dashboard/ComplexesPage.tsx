import { useEffect, useState, type FormEvent } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { AvatarImage } from "../../components/ui/AvatarImage";
import { LogoFilePicker } from "../../components/ui/LogoFilePicker";
import { CustomSelect, type SelectOption } from "../../components/ui/Select";
import { useAuth } from "../../auth/useAuth";
import { createResidentialComplex, fetchOrganizations, fetchResidentialComplexes } from "../../services/auth-context";
import { uploadComplexLogo } from "../../services/storage-service";
import type { Organization } from "../../types/auth";
import type { ResidentialComplex } from "../../types/user";
import { getApiErrorMessage } from "../../utils/api-error-message.mjs";
import { slugifyComplexName } from "./complex-slug.mjs";

export function ComplexesPage() {
  const { session } = useAuth();
  const roleCode = session?.roleCode ?? session?.user?.roleCode;
  const isDev = roleCode === "ROLE_DEV";
  const organizationId = session?.user?.organizationId ?? session?.organizationId ?? "";
  const [items, setItems] = useState<ResidentialComplex[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", organizationId, contactEmail: "", contactPhone: "", planCode: "BASIC" });
  const organizationOptions: SelectOption[] = [
    { value: "", label: "Seleccionar organización" },
    ...organizations.map((organization) => ({ value: organization.id, label: organization.name })),
  ];
  const planOptions: SelectOption[] = [
    { value: "BASIC", label: "Básico" },
    { value: "STANDARD", label: "Estándar" },
    { value: "PREMIUM", label: "Premium" },
  ];
  const load = async () => {
    setLoading(true);
    try {
      const [complexList, organizationList] = await Promise.all([
        fetchResidentialComplexes(),
        isDev ? fetchOrganizations() : Promise.resolve([] as Organization[]),
      ]);
      setItems(complexList); setOrganizations(organizationList); setError("");
    } catch (err) { setError(getApiErrorMessage(err, "No fue posible cargar los conjuntos residenciales.")); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [organizationId, isDev]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const targetOrganizationId = isDev ? form.organizationId : undefined;
    if (isDev && !targetOrganizationId) { setError("Selecciona la organización a la que pertenece el conjunto."); setSaving(false); return; }
    try {
      const created = await createResidentialComplex({ name: form.name.trim(), slug: slugifyComplexName(form.name), contactEmail: form.contactEmail.trim(), ...(form.contactPhone.trim() && { contactPhone: form.contactPhone.trim() }), ...(targetOrganizationId && { organizationId: targetOrganizationId }), planCode: form.planCode });
      let logoFailed = false;
      if (logo) { try { const uploaded = await uploadComplexLogo(created.id, logo); created.urlLogo = uploaded.urlLogo; } catch { logoFailed = true; } }
      setItems((current) => [created, ...current]); setForm({ name: "", organizationId: isDev ? form.organizationId : organizationId, contactEmail: "", contactPhone: "", planCode: "BASIC" }); setLogo(null);
      setNotice(logoFailed ? "Conjunto creado; el logo no se pudo cargar. Puedes volver a intentarlo desde el selector de contexto." : "Conjunto residencial creado correctamente.");
    } catch (err) { setError(getApiErrorMessage(err, "No se pudo crear el conjunto residencial.")); }
    finally { setSaving(false); }
  };
  return <section className="entity-admin-page entity-admin-page--animated">
    <header className="entity-admin-heading"><div><span className="entity-admin-eyebrow">Administración de propiedades</span><h1>Conjuntos residenciales</h1><p>Registra conjuntos y asígnalos a su organización.</p></div><button type="button" className="secondary-button entity-refresh" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/>Actualizar</button></header>
    {error && <div className="dashboard-alert">{error}</div>}{notice && <div className={`dashboard-alert ${notice.startsWith("Conjunto residencial creado") ? "success" : "warning"}`}>{notice}</div>}
    <div className="entity-admin-grid">
      <form className="entity-form-card" onSubmit={(event) => void submit(event)}>
        <div className="entity-card-heading"><span className="entity-icon"><Building2 size={18}/></span><div><h2>Nuevo conjunto</h2><p>Los campos con * son obligatorios.</p></div></div>
        {isDev ? <div className="entity-field"><label>Organización *</label><CustomSelect options={organizationOptions} value={form.organizationId} onChange={(value) => setForm({ ...form, organizationId: value })} placeholder="Seleccionar organización" disabled={saving}/></div> : <div className="entity-scope-note"><strong>Organización</strong><span>{session?.organizationName || "Se asignará a tu organización"}</span></div>}
        <label>Nombre del conjunto *<input required minLength={2} maxLength={150} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Mirador de los Pinos" disabled={saving}/></label>
        <label>Correo de contacto *<input type="email" required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="administracion@conjunto.com" disabled={saving}/></label>
        <label>Teléfono<input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+57 300 123 4567" disabled={saving}/></label>
        {isDev && <div className="entity-field"><label>Plan</label><CustomSelect options={planOptions} value={form.planCode} onChange={(value) => setForm({ ...form, planCode: value })} disabled={saving}/></div>}
        <LogoFilePicker file={logo} onChange={setLogo} disabled={saving}/><button className="inline-button entity-submit" type="submit" disabled={saving}>{saving ? "Creando..." : "Crear conjunto"}</button>
      </form>
      <div className="entity-list-card"><div className="entity-card-heading"><span className="entity-icon"><Building2 size={18}/></span><div><h2>Conjuntos registrados</h2><p>{items.length} en total</p></div></div>
        {loading ? <p className="entity-list-empty">Cargando conjuntos...</p> : items.length === 0 ? <p className="entity-list-empty">No hay conjuntos disponibles para esta organización.</p> : <div className="entity-list">{items.map((item) => <article className="entity-list-row" key={item.id}><AvatarImage src={item.urlLogo ?? item.logoUrl} name={item.name} size={48}/><div className="entity-list-info"><strong>{item.name}</strong><span>{item.contactEmail || "Sin correo"}</span></div><span className={`entity-status ${Number(item.status ?? 1) === 1 ? "is-active" : ""}`}>{Number(item.status ?? 1) === 1 ? "Activo" : "Inactivo"}</span></article>)}</div>}
      </div>
    </div>
  </section>;
}
