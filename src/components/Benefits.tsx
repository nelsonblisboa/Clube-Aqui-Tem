import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Shield, Heart, Stethoscope, Pill, UserCheck } from "lucide-react";

const benefits = [
  {
    icon: Tag,
    title: "Cupons de Desconto",
    description: "Descontos exclusivos em comércios locais parceiros",
    color: "text-brand-orange",
  },
  {
    icon: Shield,
    title: "Assistência Funeral",
    description: "Assistência funeral individual para sua tranquilidade",
    color: "text-primary",
  },
  {
    icon: Heart,
    title: "Acidente Pessoal",
    description: "Assistência completa em caso de acidentes pessoais",
    color: "text-brand-orange",
  },
  {
    icon: Stethoscope,
    title: "Telemedicina 24h",
    description: "Atendimento médico online a qualquer hora",
    color: "text-primary",
  },
  {
    icon: Pill,
    title: "Descontos em Farmácias",
    description: "Economia na compra de medicamentos",
    color: "text-brand-orange",
  },
  {
    icon: UserCheck,
    title: "Consultas Médicas",
    description: "Descontos em consultas com especialistas",
    color: "text-primary",
  },
];

const Benefits = () => {
  return (
    <section id="beneficios" className="py-16 md:py-24 bg-background relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="accent-bar mx-auto mb-6"></div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-brand font-extrabold text-primary mb-4">
            Benefícios para Associados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Por apenas <span className="text-accent font-bold">R$19,99/mês</span>, tenha acesso a todos esses benefícios exclusivos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-fade-in-up border-border group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 ${benefit.color} group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon size={28} />
                </div>
                <CardTitle className="text-xl text-foreground font-brand">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground font-body">{benefit.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
