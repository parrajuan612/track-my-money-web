import Image from "next/image";

function StatCard({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-[16px] border border-white/70 bg-white/90 p-3 shadow-[0_18px_45px_rgba(76,61,136,0.10)] backdrop-blur-sm">
      <p className="text-[0.75rem] text-[#7f8197]">{title}</p>
      <p className="mt-0.5 text-[0.95rem] font-extrabold tracking-tight text-[#26263d]">
        {value}
      </p>
      {children}
    </div>
  );
}

export function LoginHero() {
  return (
    <section className="flex flex-col">
      {/* 1. Texto Superior */}
      <div className="max-w-[400px] mb-4 md:mb-6">
        <h1 className="text-[3.2rem] font-black leading-[0.88] tracking-tight text-[#1f1f35] md:text-[4.5rem]">
          <span className="block">TRACK</span>
          <span className="block">MY</span>
          <span className="block text-[#5b38ff]">MONEY</span>
        </h1>
        <p className="mt-4 max-w-[280px] text-[0.95rem] leading-6 text-[#7a7b92]">
          Entiende tu dinero, mejora tu vida.
        </p>
      </div>

      {/* 2. Contenedor Ilustración + Tarjetas */}
      <div className="flex items-start w-full mt-6 lg:mt-10 relative min-h-[500px] pb-10">
        
        {/* Imagen */}
        <div className="absolute -top-[20px] -left-[40px] w-[450px] z-10 mix-blend-darken">
          <Image
            src="/login-illustration.png"
            alt="Ilustración del login"
            width={450}
            height={500}
            priority
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Tarjetas: 
            CAMBIO CLAVE: 
            1. ml-[300px] para empujarlas más a la derecha y liberar la laptop.
            2. -mt-6 para subirlas y que la primera quede alineada casi a la altura de la cabeza.
        */}
        <div className="relative z-20 flex flex-col gap-5 ml-[300px] w-[200px] -mt-6">
          
          <div className="transform translate-x-4">
            <StatCard title="Gastos este mes" value="$1,880.00">
              <div className="mt-2 h-10 rounded-xl bg-[#f6f2ff] p-2.5">
                <div className="flex h-full items-end gap-1.5">
                  <span className="h-3 w-1.5 rounded-full bg-[#5b38ff]/55" />
                  <span className="h-4 w-1.5 rounded-full bg-[#5b38ff]/55" />
                  <span className="h-2 w-1.5 rounded-full bg-[#5b38ff]/55" />
                  <span className="h-5 w-1.5 rounded-full bg-[#5b38ff]/55" />
                  <span className="h-3 w-1.5 rounded-full bg-[#5b38ff]/55" />
                  <span className="h-6 w-1.5 rounded-full bg-[#5b38ff]/55" />
                  <span className="h-4 w-1.5 rounded-full bg-[#5b38ff]/55" />
                </div>
              </div>
            </StatCard>
          </div>

          <div className="transform translate-x-12">
            <StatCard title="Presupuesto" value="75%">
              <div className="mt-3 h-1.5 rounded-full bg-[#ece9f6]">
                <div className="h-1.5 w-[75%] rounded-full bg-[#6b46ff]" />
              </div>
            </StatCard>
          </div>

          <div className="transform translate-x-6">
            <StatCard title="Metas" value="Viaje a Europa">
              <div className="mt-1 text-[0.75rem] text-[#8c8ca5]">$1,300 / $1,500</div>
              <div className="mt-2 h-1.5 rounded-full bg-[#ece9f6]">
                <div className="h-1.5 w-[86%] rounded-full bg-[#6b46ff]" />
              </div>
            </StatCard>
          </div>

        </div>
      </div>
    </section>
  );
}