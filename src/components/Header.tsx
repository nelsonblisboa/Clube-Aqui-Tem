import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Clube Aqui Tem" className="w-11 h-11 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-brand font-extrabold text-primary tracking-tight">Clube</span>
              <span className="text-lg font-brand font-bold text-accent -mt-1">Aqui Tem</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection("inicio")} className="text-foreground hover:text-primary transition-colors">
              Início
            </button>
            <button onClick={() => scrollToSection("beneficios")} className="text-foreground hover:text-primary transition-colors">
              Benefícios
            </button>
            <button onClick={() => scrollToSection("parceiro")} className="text-foreground hover:text-primary transition-colors">
              Seja um Parceiro
            </button>
            <button onClick={() => scrollToSection("login")} className="text-foreground hover:text-primary transition-colors">
              Login Associado
            </button>
            <Link to="/associar">
              <Button variant="hero" size="lg">
                Seja Associado por R$19,99/mês
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 flex flex-col gap-4 pb-4 animate-fade-in-up">
            <button onClick={() => scrollToSection("inicio")} className="text-foreground hover:text-primary transition-colors text-left">
              Início
            </button>
            <button onClick={() => scrollToSection("beneficios")} className="text-foreground hover:text-primary transition-colors text-left">
              Benefícios
            </button>
            <button onClick={() => scrollToSection("parceiro")} className="text-foreground hover:text-primary transition-colors text-left">
              Seja um Parceiro
            </button>
            <button onClick={() => scrollToSection("login")} className="text-foreground hover:text-primary transition-colors text-left">
              Login Associado
            </button>
            <Link to="/associar">
              <Button variant="hero" size="lg" className="w-full">
                Seja Associado por R$19,99/mês
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
