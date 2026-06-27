export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sage-light/30 via-background to-sage-light/20">
      {/* Decorative SOL icons */}
      <div className="absolute -top-20 -right-20 opacity-[0.05] pointer-events-none">
        <img src="/sol-icon.svg" alt="" className="w-[250px] sm:w-[350px]" />
      </div>
      <div className="absolute -bottom-20 -left-20 opacity-[0.05] pointer-events-none rotate-45">
        <img src="/sol-icon.svg" alt="" className="w-[250px] sm:w-[350px]" />
      </div>
      <div className="absolute top-1/3 left-1/4 opacity-[0.03] pointer-events-none">
        <img src="/sol-shape-gardenie.png" alt="" className="w-[200px]" />
      </div>
      {children}
    </div>
  );
}
