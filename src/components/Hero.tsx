import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section id="inicio" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
              Economize mais todos os dias com o Clube Aqui Tem
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Por apenas <span className="font-bold text-accent">R$19,99/mês</span> você garante descontos exclusivos, serviços de saúde e assistência.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg">
                Quero ser Associado
              </Button>
              <Button variant="outline" size="lg" className="text-lg">
                Saiba Mais
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-accent/10 rounded-3xl blur-3xl"></div>
            <img
              src={heroImage}
              alt="Pessoas felizes aproveitando descontos e benefícios"
              className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
