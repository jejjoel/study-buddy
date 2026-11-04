export default function Dots({ total, active }: { total: number; active: number }) {
  return (
    <div className="fp-dots" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`fp-dot${i === active ? " fp-dot--active" : ""}`} />
      ))}
    </div>
  );
}
