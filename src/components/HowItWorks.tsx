import { UserPlus, CreditCard, Gift, ArrowRight, Clock, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Cadastre-se Agora",
    description: "Preencha seus dados em menos de 2 minutos e garanta sua vaga.",
    highlight: "Vagas Limitadas",
    trigger: "Mais de 500 pessoas se cadastraram esta semana!"
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Assine por R$19,99/mês",
    description: "Investimento menor que um lanche! Cancele quando quiser.",
    highlight: "Sem Fidelidade",
    trigger: "Economia garantida desde o primeiro cupom!"
  },
  {
    number: "03",
    icon: Gift,
    title: "Aproveite os Benefícios",
    description: "Acesse cupons exclusivos, descontos em saúde e muito mais.",
    highlight: "Acesso Imediato",
    trigger: "Mais de 100 parceiros esperando por você!"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4">
        {/* Header with urgency trigger */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4 animate-pulse">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">Oferta por tempo limitado</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-brand font-bold mb-4">
            <span className="text-primary">Como</span>{" "}
            <span className="text-accent">Funciona?</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Em apenas <span className="text-primary font-semibold">3 passos simples</span> você começa a economizar. 
            Milhares de pessoas já estão aproveitando!
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30" />
          
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                {/* Highlight badge */}
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {step.highlight}
                </div>
                
                {/* Step number */}
                <div className="text-6xl font-brand font-bold text-primary/10 absolute -top-2 -left-2">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/30">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-brand font-bold text-foreground mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-4 relative z-10">
                  {step.description}
                </p>
                
                {/* Social proof trigger */}
                <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 px-3 py-2 rounded-lg">
                  <Users className="w-4 h-4" />
                  <span>{step.trigger}</span>
                </div>
                
                {/* Arrow for next step */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-accent rounded-full items-center justify-center shadow-lg">
                    <ArrowRight className="w-4 h-4 text-accent-foreground" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Pagamento 100% Seguro</span>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full">
            <Clock className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">Ativação Instantânea</span>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">+5.000 Associados Ativos</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
