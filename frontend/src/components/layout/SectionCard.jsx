const SectionCard = ({ title, children, className = '' }) => {
  return (
    <section className={`cyber-card ${className}`}>
      {title && (
        <h2 className="text-sm font-black text-[var(--accent-primary)] uppercase tracking-widest mb-4 border-l-2 border-[var(--accent-secondary)] pl-2">
          {title}
        </h2>
      )}
      <div className="text-[var(--text-primary)]">
        {children}
      </div>
    </section>
  );
};

export default SectionCard;