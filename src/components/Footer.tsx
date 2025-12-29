import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Clube Aqui Tem" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold">Clube Aqui Tem</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Seu clube de vantagens e benefícios. Economize todos os dias com descontos exclusivos.
            </p>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Links Úteis</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-accent transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Como Funciona</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Parceiros</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Legal</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-accent transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Cancelamento</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Contato</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                <a href="mailto:clubeaquitem.comercial@gmail.com" className="hover:text-accent transition-colors">
                  clubeaquitem.comercial@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                <a href="tel:+5521964168479" className="hover:text-accent transition-colors">
                  (21) 96416-8479
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-accent" />
                <span>Nova Iguaçu - RJ</span>
              </li>
              <li className="text-xs">
                Rua Padre Aloisio Rucha, 75 - Loja 13<br />
                Comendador Soares
              </li>
            </ul>
          </div>
        </div>

        {/* Redes Sociais e Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/80">
              © 2025 Clube Aqui Tem. Todos os direitos reservados.
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
