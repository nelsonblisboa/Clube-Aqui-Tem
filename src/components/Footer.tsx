import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 notranslate" translate="no">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img loading="lazy" src={logo} alt="Clube Aqui Tem" className="w-12 h-12 object-contain" />
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-brand font-extrabold text-primary-foreground tracking-tight">Clube</span>
                <span className="text-lg font-brand font-bold text-accent -mt-1">Aqui Tem</span>
                <span className="text-[9px] text-white/60 font-medium uppercase tracking-widest -mt-0.5">Vantagens e Benefícios</span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 font-body">
              Seu clube de vantagens e benefícios. Economize todos os dias com descontos exclusivos.
            </p>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Links Úteis</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="/#inicio" className="hover:text-accent transition-colors">
                  <span className="notranslate" translate="no">Sobre Nós</span>
                </a>
              </li>
              <li>
                <a href="/#como-funciona" className="hover:text-accent transition-colors">
                  <span className="notranslate" translate="no">Como Funciona</span>
                </a>
              </li>
              <li>
                <Link to="/seja-parceiro" className="hover:text-accent transition-colors">
                  <span className="notranslate" translate="no">Seja um Parceiro</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Institucional (Renomeado para evitar conflito com Legal/Juridico) */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Institucional</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link to="/politica-de-privacidade" className="hover:text-accent transition-colors">
                  <span className="notranslate" translate="no">Política de Privacidade</span>
                </Link>
              </li>
              <li>
                <Link to="/termos-de-uso" className="hover:text-accent transition-colors">
                  <span className="notranslate" translate="no">Termos de Uso</span>
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-accent transition-colors">
                  <span className="notranslate" translate="no">Ajuda e Suporte</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Contato</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                <a
                  href="mailto:clubeaquitem.comercial@gmail.com"
                  className="hover:text-accent transition-colors"
                >
                  <span className="notranslate" translate="no">clubeaquitem.comercial@gmail.com</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                <a href="tel:+5521964168479" className="hover:text-accent transition-colors">
                  <span className="notranslate" translate="no">(21) 96416-8479</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-accent" />
                <span className="notranslate" translate="no">Nova Iguaçu - RJ</span>
              </li>
              <li className="text-xs leading-relaxed text-primary-foreground/70">
                <span className="notranslate" translate="no">
                  Rua Padre Aloisio Rucha, 75 - Loja 13<br />
                  Comendador Soares
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Redes Sociais e Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/80">
              © 2025 Clube Aqui Tem Vantagens e Benefícios. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/clubeaquitem" target="_blank" rel="noopener noreferrer" className="text-primary-foreground hover:text-accent transition-colors" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="https://www.instagram.com/clubeaquitem" target="_blank" rel="noopener noreferrer" className="text-primary-foreground hover:text-accent transition-colors" aria-label="Instagram">
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
