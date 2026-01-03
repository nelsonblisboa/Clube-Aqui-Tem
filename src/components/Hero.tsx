import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
              <Button variant="outline" size="lg" className="text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Saiba Mais
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-scale-in">
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 rounded-3xl blur-2xl"></div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
            <img
              src={heroImage}
              alt="Pessoas felizes aproveitando descontos e benefícios"
              className="relative rounded-3xl shadow-2xl w-full h-auto object-cover border-4 border-background"
            />
            {/* Price badge */}
            <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground px-6 py-3 rounded-2xl shadow-accent font-brand font-bold text-lg transform rotate-3 hover:rotate-0 transition-transform">
              R$19,99/mês
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
