export function TrustBar() {
  const partners = [
    "MedPlus",
    "HealthNet",
    "PharmaCare",
    "QuickMeds",
    "SafeScript",
    "VitaLink",
  ];

  return (
    <section className="py-6 bg-white border-t border-gray-100 border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">
            Trusted Partners & Certifications
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {partners.map((partner) => (
            <div
              key={partner}
              className="px-4 py-2 rounded-full border border-teal-100 bg-teal-50 text-primary font-semibold text-sm transition-all duration-300 hover:border-primary hover:bg-primary/5 cursor-default"
            >
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
