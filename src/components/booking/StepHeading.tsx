export function StepHeading({ step, title, lede }: { step: number; title: string; lede?: string }) {
  return (
    <header className="mb-6">
      <p className="eyebrow mb-2">Step {step} of 5</p>
      <h1 className="display-lg">{title}</h1>
      {lede && <p className="mt-2 text-[14px] text-muted">{lede}</p>}
    </header>
  );
}

export function BackButton({ onClick, children = "Back" }: { onClick: () => void; children?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="btn-ghost mt-6">
      ← {children}
    </button>
  );
}
