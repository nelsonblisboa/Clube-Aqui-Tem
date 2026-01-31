import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Search, ShoppingBag, ExternalLink, Ticket, Copy, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Coupon {
    id: string | number;
    store: string;
    logo?: string;
    description: string;
    code?: string;
    link: string;
    category: string;
    validUntil?: string;
    source_platform?: string;
    discount_value?: string;
}

const StoreLogo = ({ store, link, manualLogo }: { store: string, link: string, manualLogo?: string }) => {
    const [imgSrc, setImgSrc] = useState<string | null>(manualLogo || null);
    const [triedClearbit, setTriedClearbit] = useState(false);
    const [triedGoogle, setTriedGoogle] = useState(false);

    useEffect(() => {
        // Reset state when props change
        setImgSrc(manualLogo || null);
        setTriedClearbit(false);
        setTriedGoogle(false);
    }, [store, link, manualLogo]);

    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname;
        } catch {
            return null;
        }
    };

    const handleError = () => {
        const domain = getDomain(link);

        if (!triedClearbit && domain) {
            setTriedClearbit(true);
            setImgSrc(`https://logo.clearbit.com/${domain}`);
            return;
        }

        if (!triedGoogle && domain) {
            setTriedGoogle(true);
            setImgSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
            return;
        }

        setImgSrc(null); // Fallback to icon
    };

    // If no initial manual logo, start trying fetching immediately
    useEffect(() => {
        if (!manualLogo && !imgSrc) {
            handleError();
        }
    }, []);

    if (!imgSrc) {
        return <ShoppingBag className="text-gray-300 w-5 h-5" />;
    }

    return (
        <img
            src={imgSrc}
            alt={store}
            className="w-full h-full object-contain"
            onError={handleError}
            loading="lazy"
        />
    );
};

const CuponsDesconto = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const { data: rawData, error } = await supabase
                .from('external_coupons' as any)
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            const data = rawData as any[];

            if (error) throw error;

            if (data && data.length > 0) {
                const formattedCoupons: Coupon[] = data.map(item => ({
                    id: item.id,
                    store: item.store_name,
                    description: item.title,
                    code: item.code || "VER OFERTA",
                    link: item.destination_url || "#",
                    category: item.category || "Variedades",
                    source_platform: item.source_platform,
                    discount_value: item.discount_value,
                    validUntil: item.expiration_date ? new Date(item.expiration_date).toLocaleDateString('pt-BR') : undefined,
                    logo: getStoreLogo(item.store_name)
                }));
                // Only real data
                setCoupons(formattedCoupons);
            }
        } catch (error) {
            console.error("Erro ao buscar cupons:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStoreLogo = (storeName: string) => {
        const lowerName = storeName.toLowerCase();
        if (lowerName.includes('amazon')) return "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg";
        if (lowerName.includes('magalu') || lowerName.includes('magazine')) return "https://upload.wikimedia.org/wikipedia/commons/9/9e/Magalu_Logo.png";
        if (lowerName.includes('shopee')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopee_logo.svg/2560px-Shopee_logo.svg.png";
        if (lowerName.includes('ifood')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Ifood_logo.svg/2560px-Ifood_logo.svg.png";
        if (lowerName.includes('mercado')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Mercado_Livre_logo.svg/2560px-Mercado_Livre_logo.svg.png";
        if (lowerName.includes('casas bahia')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Casas_Bahia_logo.svg/1200px-Casas_Bahia_logo.svg.png";
        if (lowerName.includes('netshoes')) return "https://upload.wikimedia.org/wikipedia/commons/f/f5/Netshoes_logo.png";
        if (lowerName.includes('submarino')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Submarino_logo.svg/2560px-Submarino_logo.svg.png";
        if (lowerName.includes('americanas')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Americanas_logo.svg/2560px-Americanas_logo.svg.png";
        return undefined;
    };

    const categories = Array.from(new Set(coupons.map(c => c.category)));

    const filteredCoupons = coupons.filter(coupon => {
        const matchesSearch = coupon.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? coupon.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const copyCode = (code: string | undefined) => {
        if (!code || code === "VER OFERTA") return;
        navigator.clipboard.writeText(code);
        toast.success(`Cupom copiado!`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <SEO
                title="Cupons de Desconto Online"
                description="Economize em grandes lojas com os cupons exclusivos do Clube Aqui Tem."
            />
            <Header />

            {/* Header Compacto */}
            <div className="bg-white border-b pt-24 pb-8 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Ticket className="text-primary w-5 h-5" />
                                <h1 className="text-2xl font-bold text-gray-900">Cupons & Ofertas</h1>
                            </div>
                            <p className="text-gray-500 text-sm">Atualizado em tempo real com as melhores lojas.</p>
                        </div>

                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar loja..."
                                    className="pl-9 h-10 rounded-full bg-gray-100 border-transparent focus:bg-white transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Filters */}
                    {categories.length > 0 && (
                        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
                            <Button
                                size="sm"
                                variant={selectedCategory === null ? "default" : "outline"}
                                onClick={() => setSelectedCategory(null)}
                                className="rounded-full px-4 h-8 text-xs"
                            >
                                Todas
                            </Button>
                            {categories.map(cat => (
                                <Button
                                    key={cat}
                                    size="sm"
                                    variant={selectedCategory === cat ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                    className="rounded-full px-4 h-8 text-xs whitespace-nowrap"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-grow container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-gray-500 animate-pulse">Buscando melhores ofertas...</p>
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-600">Nenhuma oferta encontrada</h3>
                        <p className="text-gray-400 text-sm">Tente buscar por outras lojas em breve.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredCoupons.map((coupon, index) => (
                            <motion.div
                                key={coupon.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="h-full border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden bg-white group flex flex-col ring-1 ring-gray-100">
                                    <div className="p-4 flex gap-3 items-start relative">
                                        <div className="w-10 h-10 rounded-lg border border-gray-100 p-1 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                                            <StoreLogo store={coupon.store} link={coupon.link} manualLogo={coupon.logo} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{coupon.store}</h3>
                                                {coupon.source_platform && (
                                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                                        {coupon.source_platform}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{coupon.category}</p>
                                        </div>
                                    </div>

                                    <CardContent className="px-4 py-0 flex-grow">
                                        <p className="text-gray-700 text-sm font-medium leading-snug line-clamp-2 min-h-[40px] mb-3" title={coupon.description}>
                                            {coupon.description}
                                        </p>

                                        {coupon.discount_value && coupon.discount_value !== "Oferta" && (
                                            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-none px-2 py-0.5 text-xs font-bold mb-3">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {coupon.discount_value}
                                            </Badge>
                                        )}
                                    </CardContent>

                                    <CardFooter className="p-4 pt-2 mt-auto">
                                        {(coupon.code && coupon.code !== "VER OFERTA") ? (
                                            <div className="w-full flex gap-2">
                                                <div
                                                    className="flex-1 bg-gray-50 border border-dashed border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors group/code"
                                                    onClick={() => copyCode(coupon.code)}
                                                >
                                                    <code className="text-xs font-mono font-bold text-primary truncate">
                                                        {coupon.code}
                                                    </code>
                                                    <Copy className="w-3 h-3 text-gray-400 group-hover/code:text-primary transition-colors" />
                                                </div>
                                                <Button
                                                    size="icon"
                                                    className="h-9 w-9 shrink-0 rounded-lg shadow-none"
                                                    onClick={() => window.open(coupon.link, '_blank')}
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full h-9 rounded-lg text-sm font-medium shadow-sm hover:translate-y-[-1px] transition-transform"
                                                onClick={() => window.open(coupon.link, '_blank')}
                                            >
                                                Ver Oferta
                                                <ExternalLink className="w-3 h-3 ml-2" />
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CuponsDesconto;
