import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, TrendingUp, Users, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const PartnerCTA = () => {
    const navigate = useNavigate();
    return (
        <section id="parceiro" className="py-20 bg-primary/5 relative overflow-hidden">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6 text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm">
                                    <Store className="w-4 h-4" />
                                    <span>Para Empresas e Comércios</span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-brand font-extrabold text-foreground">
                                    Traga seu negócio para o <br />
                                    <span className="text-primary">Clube Aqui Tem</span>
                                </h2>

                                <p className="text-lg text-muted-foreground">
                                    Divulgue sua marca <span className="text-foreground font-semibold">gratuitamente</span> para nossos associados e aumente seu fluxo de clientes. Sem mensalidade, sem taxas escondidas.
                                </p>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Novos Clientes</h4>
                                            <p className="text-sm text-muted-foreground">Acesso direto à base de associados</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Visibilidade Gratuita</h4>
                                            <p className="text-sm text-muted-foreground">Sua marca em nosso aplicativo e site</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        variant="hero"
                                        size="lg"
                                        onClick={() => navigate("/seja-parceiro")}
                                        className="text-lg shadow-lg group-hover:shadow-accent/20 cursor-pointer"
                                    >
                                        Quero ser Parceiro
                                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-3">
                                        *Cadastro sujeito a aprovação.
                                    </p>
                                </div>
                            </div>

                            <div className="relative hidden md:block">
                                {/* Illustration / Graphic */}
                                <div className="relative z-10 grid grid-cols-2 gap-4">
                                    <Card className="bg-background/80 backdrop-blur border-border p-4 transform translate-y-8 animate-pulse shadow-lg">
                                        <div className="h-2 w-12 bg-primary/20 rounded mb-2"></div>
                                        <div className="text-2xl font-bold text-primary">+45%</div>
                                        <div className="text-xs text-muted-foreground">Fluxo de Clientes</div>
                                    </Card>
                                    <Card className="bg-background/80 backdrop-blur border-border p-4 transform -translate-y-4 shadow-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">%</div>
                                            <div className="text-sm font-semibold">Descontos</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">Você define a regra</div>
                                    </Card>
                                    <Card className="bg-background/80 backdrop-blur border-border p-4 col-span-2 transform translate-y-2 shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                                                    <Store size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">Seu Negócio</div>
                                                    <div className="text-xs text-green-500">Parceiro Verificado</div>
                                                </div>
                                            </div>
                                            <div className="text-accent font-bold">Ativo</div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Blob background behind cards */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl -z-10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PartnerCTA;
