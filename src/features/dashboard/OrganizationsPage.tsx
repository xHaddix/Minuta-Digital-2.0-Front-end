import { useEffect, useState, type FormEvent } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { AvatarImage } from "../../components/ui/AvatarImage";
import { LogoFilePicker } from "../../components/ui/LogoFilePicker";
import { useAuth } from "../../auth/useAuth";
import { createOrganization, fetchOrganizations } from "../../services/auth-context";
import { uploadOrganizationLogo } from "../../services/storage-service";
import type { Organization } from "../../types/auth";
import { getApiErrorMessage } from "../../utils/api-error-message.mjs";

export function OrganizationsPage() {
  const { session } = useAuth();
  const isDev = (session?.roleCode ?? session?.user?.roleCode) === "ROLE_DEV";
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", identification: "", contactEmail: "", contactPhone: "" });
  const load = async () => { setLoading(true); try { setItems(await fetchOrganizations()); setError(""); } catch (err) { setError(getApiErrorMessage(err, "No fue posible cargar las organizaciones.")); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const created = await createOrganization({ name: form.name.trim(), contactEmail: form.contactEmail.trim(), ...(form.identification.trim() && { identification: form.identification.trim() }), ...(form.contactPhone.trim() && { contactPhone: form.contactPhone.trim() }) });
      let logoFailed = false;
      if (logo) { try { const uploaded = await uploadOrganizationLogo(created.id, logo); created.urlLogo = uploaded.urlLogo; } catch { logoFailed = true; } }
      setItems((current) => [created, ...current]); setForm({ name: "", identification: "", contactEmail: "", contactPhone: "" }); setLogo(null);
      setNotice(logoFailed ? "Organización creada; el logo no se pudo cargar. Puedes volver a intentarlo desde el selector de contexto." : "Organización creada correctamente.");
    } catch (err) { setError(getApiErrorMessage(err, "No se pudo crear la organización.")); } finally { setSaving(false); }
  };
  return <section className="entity-admin-page entity-admin-page--animated">
    <header className="entity-admin-heading"><div><span className="entity-admin-eyebrow">Administración global</span><h1>Organizaciones</h1><p>Gestiona las organizaciones y sus datos de contacto.</p></div><button type="button" className="secondary-button entity-refresh" onClick={() => void load()} disabled={loading}><RefreshCw size={16}/>Actualizar</button></header>
    {!isDev && <div className="dashboard-alert">La creación de organizaciones está reservada al rol Desarrollador. Como administrador de organización puedes crear conjuntos residenciales.</div>}
    {error && <div className="dashboard-alert">{error}</div>}{notice && <div className={`dashboard-alert ${notice.startsWith("Organización creada correctamente") ? "success" : "warning"}`}>{notice}</div>}
    <div className="entity-admin-grid">
      {isDev && <form className="entity-form-card" onSubmit={(event) => void submit(event)}>
        <div className="entity-card-heading"><span className="entity-icon"><Building2 size={18}/></span><div><h2>Nueva organización</h2><p>Los campos con * son obligatorios.</p></div></div>
        <label>Nombre de la organización *<input required minLength={2} maxLength={150} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Grupo Residencial Andino" disabled={saving}/></label>
        <label>NIT / Identificación<input value={form.identification} onChange={(e) => setForm({ ...form, identification: e.target.value })} placeholder="900123456-7" disabled={saving}/></label>
        <label>Correo de contacto *<input type="email" required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="contacto@empresa.com" disabled={saving}/></label>
        <label>Teléfono<input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+57 300 123 4567" disabled={saving}/></label>
        <LogoFilePicker file={logo} onChange={setLogo} disabled={saving}/><button className="inline-button entity-submit" type="submit" disabled={saving}>{saving ? "Creando..." : "Crear organización"}</button>
      </form>}
      <div className="entity-list-card"><div className="entity-card-heading"><span className="entity-icon"><Building2 size={18}/></span><div><h2>Organizaciones registradas</h2><p>{items.length} en total</p></div></div>
        {loading ? <p className="entity-list-empty">Cargando organizaciones...</p> : items.length === 0 ? <p className="entity-list-empty">No hay organizaciones disponibles.</p> : <div className="entity-list">{items.map((item) => <article className="entity-list-row" key={item.id}><AvatarImage src={item.urlLogo ?? item.logoUrl} name={item.name} size={48}/><div className="entity-list-info"><strong>{item.name}</strong><span>{item.contactEmail || "Sin correo"}</span><small>{item.identification || "Sin identificación"}</small></div><span className="entity-status is-active">Activa</span></article>)}</div>}
      </div>
    </div>
  </section>;
}
