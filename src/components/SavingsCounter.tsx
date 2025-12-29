import { useState, useEffect } from "react";
import { TrendingUp, Percent, ShoppingBag, Heart, Car, Utensils, Sparkles } from "lucide-react";

const discountExamples = [
  { category: "Restaurantes", icon: Utensils, originalPrice: 80, discount: 40 },
  { category: "Farmácias", icon: Heart, originalPrice: 150, discount: 50 },
  { category: "Postos de Combustível", icon: Car, originalPrice: 200, discount: 30 },
  { category: "Lojas", icon: ShoppingBag, originalPrice: 300, discount: 45 },
  { category: "Beleza & Estética", icon: Sparkles, originalPrice: 120, discount: 50 },
];

const SavingsCounter = () => {
  const [totalSavings, setTotalSavings] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const targetSavings = 847; // Monthly savings simulation

  // Animate counter on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = targetSavings / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetSavings) {
        setTotalSavings(targetSavings);
        clearInterval(timer);
      } else {
        setTotalSavings(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Rotate examples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % discountExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const example = discountExamples[currentExample];
  const ExampleIcon = example.icon;
  const savingsAmount = (example.originalPrice * example.discount) / 100;

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Economia Real</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-brand font-bold mb-4">
            <span className="text-foreground">Quanto Você Pode</span>{" "}
            <span className="text-accent">Economizar?</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Main Counter */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl shadow-primary/10 relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
            
            <div className="text-center relative z-10">
              <p className="text-muted-foreground mb-2 font-medium">Economia média mensal</p>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl text-muted-foreground">R$</span>
                <span className="text-6xl md:text-7xl font-brand font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {totalSavings.toLocaleString('pt-BR')}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full">
                <Percent className="w-4 h-4" />
                <span className="font-semibold">Até 50% de desconto</span>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                *Baseado no uso médio de 10 cupons por mês
              </p>
            </div>
          </div>

          {/* Live Example */}
          <div className="space-y-6">
            <h3 className="text-xl font-brand font-semibold text-foreground">
              Veja um exemplo de economia:
            </h3>
            
            <div className="bg-card border border-border rounded-2xl p-6 transition-all duration-500 hover:shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <ExampleIcon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{example.category}</p>
                  <p className="text-sm text-muted-foreground">Parceiro do Clube Aqui Tem</p>
                </div>
                <div className="ml-auto bg-accent text-accent-foreground text-sm font-bold px-3 py-1 rounded-full">
                  -{example.discount}%
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Preço Normal</p>
                  <p className="text-lg font-semibold text-muted-foreground line-through">
                    R$ {example.originalPrice.toFixed(2)}
                  </p>
                </div>
                <div className="bg-primary/10 rounded-xl p-4">
                  <p className="text-xs text-primary mb-1">Com Cupom</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {(example.originalPrice - savingsAmount).toFixed(2)}
                  </p>
                </div>
                <div className="bg-accent/10 rounded-xl p-4">
                  <p className="text-xs text-accent mb-1">Você Economiza</p>
                  <p className="text-lg font-bold text-accent">
                    R$ {savingsAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Category indicators */}
            <div className="flex justify-center gap-2">
              {discountExamples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentExample(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentExample 
                      ? "w-8 bg-primary" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 text-center border border-primary/20">
              <p className="text-foreground font-medium mb-2">
                🎯 Por apenas <span className="text-accent font-bold">R$19,99/mês</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Você economiza <span className="text-primary font-semibold">mais de 40x</span> o valor da assinatura!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavingsCounter;
