import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Rola para o topo sempre que o caminho muda
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant", // Usamos instant para não ter atraso visual na navegação
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
