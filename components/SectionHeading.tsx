export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {eyebrow && (
        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${light ? "text-gold-400" : "text-gold-700"}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-3 text-3xl font-semibold sm:text-4xl ${light ? "text-linen-50" : "text-royal-900"}`}>
        {title}
      </h2>
      {center && <span className="gold-rule mt-5" />}
      {subtitle && (
        <p className={`mt-4 text-base leading-relaxed ${light ? "text-slate-300" : "text-slate-600"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
