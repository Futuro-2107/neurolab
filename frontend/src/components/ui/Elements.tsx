import type { ReactNode } from 'react';
import { ArrowUpRight, Plus, Search } from 'lucide-react';

export function PageIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-intro"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2><p>{description}</p></div>{action}</div>;
}
export function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false }: { children: ReactNode; onClick?: () => void; variant?: 'primary'|'secondary'|'ghost'|'danger'; type?: 'button'|'submit'; disabled?: boolean }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`btn btn-${variant}`}>{children}</button>;
}
export function Panel({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-head"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
export function Status({ children }: { children: string }) {
  const cls = children.toLowerCase().includes('complet') || children.toLowerCase().includes('activo') || children.toLowerCase().includes('aprobado') || children.toLowerCase().includes('validado') ? 'success' : children.toLowerCase().includes('fallido') || children.toLowerCase().includes('retirado') ? 'danger' : children.toLowerCase().includes('ejecut') ? 'info' : 'warning';
  return <span className={`status status-${cls}`}><i/>{children}</span>;
}
export function SearchInput({ value, onChange, placeholder = 'Buscar...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="filter-search"><Search size={16}/><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/></label>;
}
export function EmptyHint({ text }: { text: string }) { return <div className="empty-hint"><Sparkles size={20}/><span>{text}</span></div>; }
export function AddButton({ label, onClick }: { label: string; onClick: () => void }) { return <Button onClick={onClick}><Plus size={16}/>{label}<ArrowUpRight size={14}/></Button>; }
