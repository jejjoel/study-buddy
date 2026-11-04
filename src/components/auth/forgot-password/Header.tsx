type Props = { title: string; onBack?: () => void; right?: React.ReactNode };

export default function Header({ title, onBack, right }: Props) {
  return (
    <header className="fp-header">
      <button type="button" aria-label="Kembali" onClick={onBack} className="fp-back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <h1 className="fp-header-title">{title}</h1>
      {right && <div className="fp-header-right">{right}</div>}
    </header>
  );
}
