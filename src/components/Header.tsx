import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    // Se já estamos na home, fazer scroll suave
    if (location.pathname === '/') {
      e.preventDefault();
      scrollToSection(sectionId);
    }
    // Se não estamos na home, o Link vai navegar normalmente para /#sectionId
    // e o navegador vai fazer scroll automático
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm notranslate" translate="no">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <img loading="lazy" src={logo} alt="Clube Aqui Tem" className="w-11 h-11 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-brand font-extrabold text-primary tracking-tight">Clube</span>
              <span className="text-lg font-brand font-bold text-accent -mt-1">Aqui Tem</span>
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest -mt-0.5">Vantagens e Benefícios</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/#inicio" onClick={(e) => handleNavClick(e, "inicio")} className="text-foreground hover:text-primary transition-colors">
              <span className="notranslate" translate="no">Página Inicial</span>
            </Link>
            <Link to="/#beneficios" onClick={(e) => handleNavClick(e, "beneficios")} className="text-foreground hover:text-primary transition-colors">
              <span className="notranslate" translate="no">Benefícios</span>
            </Link>
            <Link to="/#parceiro" onClick={(e) => handleNavClick(e, "parceiro")} className="text-foreground hover:text-primary transition-colors">
              <span className="notranslate" translate="no">Seja um Parceiro</span>
            </Link>
            <Link to="/contato" className="text-foreground hover:text-primary transition-colors">
              <span className="notranslate" translate="no">Contato</span>
            </Link>
            <Link to="/minha-conta" className="text-foreground hover:text-primary transition-colors">
              <span className="notranslate" translate="no">Login Associado</span>
            </Link>
            <Link to="/associar">
              <Button variant="hero" size="lg">
                <span className="notranslate" translate="no">Seja Associado por R$19,99/mês</span>
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
            <Link to="/#inicio" onClick={(e) => handleNavClick(e, "inicio")} className="text-foreground hover:text-primary transition-colors text-left">
              <span className="notranslate" translate="no">Página Inicial</span>
            </Link>
            <Link to="/#beneficios" onClick={(e) => handleNavClick(e, "beneficios")} className="text-foreground hover:text-primary transition-colors text-left">
              <span className="notranslate" translate="no">Benefícios</span>
            </Link>
            <Link to="/#parceiro" onClick={(e) => handleNavClick(e, "parceiro")} className="text-foreground hover:text-primary transition-colors text-left">
              <span className="notranslate" translate="no">Seja um Parceiro</span>
            </Link>
            <Link to="/contato" onClick={() => setIsMenuOpen(false)} className="text-foreground hover:text-primary transition-colors text-left">
              <span className="notranslate" translate="no">Contato</span>
            </Link>
            <Link to="/minha-conta" onClick={() => setIsMenuOpen(false)} className="text-foreground hover:text-primary transition-colors text-left">
              <span className="notranslate" translate="no">Login Associado</span>
            </Link>
            <Link to="/associar">
              <Button variant="hero" size="lg" className="w-full">
                <span className="notranslate" translate="no">Seja Associado por R$19,99/mês</span>
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
