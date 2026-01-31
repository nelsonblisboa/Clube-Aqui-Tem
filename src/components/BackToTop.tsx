import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/';

    // Mostrar botão quando rolar para baixo
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const goToHome = () => {
        navigate('/');
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }, 100);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed bottom-24 right-8 z-50 flex flex-col gap-3"
                >
                    {/* Botão Voltar ao Topo (aparece em todas as páginas) */}
                    <button
                        onClick={scrollToTop}
                        className="group relative bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        aria-label="Voltar ao topo"
                    >
                        <ArrowUp className="w-6 h-6" />
                        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Voltar ao topo
                        </span>
                    </button>

                    {/* Botão Ir para Home (aparece apenas em outras páginas) */}
                    {!isHomePage && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            onClick={goToHome}
                            className="group relative bg-accent hover:bg-accent/90 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                            aria-label="Ir para página inicial"
                        >
                            <Home className="w-6 h-6" />
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Ir para Home
                            </span>
                        </motion.button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
