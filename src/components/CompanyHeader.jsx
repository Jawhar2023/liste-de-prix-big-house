import { Mail, MapPin, Phone, Receipt } from 'lucide-react'

export default function CompanyHeader() {
  return (
    <header className="animate-fade-up relative overflow-hidden rounded-2xl bg-brand-brown-deep text-white shadow-xl shadow-brand-brown/25">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,184,0,0.25), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,184,0,0.12), transparent 35%), repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 8px)',
        }}
      />

      <div className="relative flex flex-col gap-5 p-5 sm:p-7 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="logo-glow shrink-0 overflow-hidden rounded-xl bg-brand-brown">
            <img
              src="/logo.jpg"
              alt="Big House Papeterie"
              className="h-20 w-20 object-cover sm:h-24 sm:w-24"
            />
          </div>
          <div>
            <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-gold-soft">
              Papeterie &amp; Fournitures
            </p>
            <h1 className="font-display text-3xl font-800 font-extrabold leading-none tracking-tight sm:text-4xl">
              Big <span className="text-brand-gold-bright">House</span>
            </h1>
            <p className="mt-1.5 text-sm text-white/70">Liste de prix professionnelle</p>
          </div>
        </div>

        <div className="grid flex-1 gap-2.5 text-sm sm:grid-cols-2 md:max-w-xl">
          <InfoRow icon={MapPin}>
            BigHouse, Rue Ibn Khaldoun, Ariana 2050
          </InfoRow>
          <InfoRow icon={Phone}>
            <a href="tel:+21652271887" className="hover:text-brand-gold-bright">
              +216 52 271 887
            </a>
          </InfoRow>
          <InfoRow icon={Mail}>
            <a
              href="mailto:bighousetunisia@gmail.com"
              className="break-all hover:text-brand-gold-bright"
            >
              bighousetunisia@gmail.com
            </a>
          </InfoRow>
          <InfoRow icon={Receipt}>
            Matricule fiscal — 1992556H/C/N/000
          </InfoRow>
        </div>
      </div>

      <div className="relative h-1.5 bg-gradient-to-r from-brand-gold via-brand-gold-bright to-brand-gold-soft" />
    </header>
  )
}

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold-bright" strokeWidth={2.2} />
      <span className="leading-snug text-white/90">{children}</span>
    </div>
  )
}
