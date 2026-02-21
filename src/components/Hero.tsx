import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section id="inicio" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="accent-bar mb-6"></div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-brand font-extrabold leading-tight">
              <span className="text-primary">Economize mais</span>
              <br />
              <span className="text-foreground">todos os dias com o</span>
              <br />
              <span className="brand-text">Clube Aqui Tem</span>
              <br />
              <span className="block text-2xl md:text-3xl font-brand font-bold text-accent mt-2">Vantagens e Benefícios</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-body">
              Por apenas <span className="font-bold text-accent text-2xl">R$19,99/mês</span> você garante descontos exclusivos, serviços de saúde e assistência.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/associar">
                <Button variant="hero" size="lg" className="text-lg shadow-accent">
                  Quero ser Associado
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  document.getElementById('como-funciona')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
              >
                Saiba Mais
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl blur-2xl"></div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
            <img loading="lazy"
              src={heroImage}
              alt="Pessoas felizes aproveitando descontos e benefícios"
              className="relative rounded-3xl shadow-2xl w-full h-auto object-cover border-4 border-background"
            />
            {/* Selo de Preço Dinâmico Animado */}
            <motion.div
              initial={{ scale: 0, rotate: -20, x: 20, y: 20 }}
              animate={{ scale: 1, rotate: 6, x: 0, y: 0 }}
              whileHover={{ scale: 1.1, rotate: 0 }}
              className="absolute -bottom-8 -right-4 z-20"
            >
              <div className="bg-accent text-white px-6 py-4 rounded-2xl shadow-[0_15px_30px_rgba(255,145,0,0.6)] border-4 border-white transform-gpu">
                <div className="flex flex-col items-center leading-none text-center">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] mb-1">Apenas</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold">R$</span>
                    <span className="text-3xl font-black tracking-tighter">19,99</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest mt-1">Mensais</span>
                </div>
              </div>
              {/* Brilho animado no selo */}
              <motion.div
                animate={{
                  x: ['-100%', '200%'],
                  opacity: [0, 0.4, 0]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 4
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent w-full h-full skew-x-12"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
