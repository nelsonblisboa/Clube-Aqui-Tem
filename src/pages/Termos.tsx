import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    FileText,
    UserCheck,
    RotateCcw,
    Scale,
    Copyright,
    Lock,
    Edit3,
    Gavel,
    CheckCircle2
} from "lucide-react";

const Termos = () => {
    const sections = [
        {
            icon: <UserCheck className="w-6 h-6 text-primary" />,
            title: "1. Aceitação dos Termos",
            content: (
                <>
                    <p className="mb-4">
                        Ao acessar e utilizar os serviços do Clube Aqui Tem, o usuário declara ter lido, compreendido e aceitado integralmente estes Termos de Uso, que constituem contrato vinculante entre o associado e o Clube.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <li className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                            <span><strong>Código Civil</strong> (Lei nº 10.406/2002)</span>
                        </li>
                        <li className="flex gap-2">
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                            <span><strong>CDC</strong> (Lei nº 8.078/1990)</span>
                        </li>
                    </ul>
                </>
            )
        },
        {
            icon: <FileText className="w-6 h-6 text-primary" />,
            title: "2. Serviços Oferecidos",
            content: (
                <ul className="space-y-2">
                    {[
                        "Rede de descontos em parceiros",
                        "Benefícios em saúde",
                        "Assistência funeral",
                        "Outros serviços conforme plano"
                    ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        {
            icon: <Scale className="w-6 h-6 text-primary" />,
            title: "3. Obrigações do Usuário",
            content: (
                <p>
                    O associado compromete-se a fornecer informações verdadeiras, utilizar os serviços de forma lícita e não compartilhar indevidamente seus acessos. O descumprimento poderá resultar em suspensão ou cancelamento.
                </p>
            )
        },
        {
            icon: <RotateCcw className="w-6 h-6 text-primary" />,
            title: "4. Cancelamento e Rescisão",
            content: (
                <p>
                    O cancelamento pode ser solicitado a qualquer momento. Caso haja fidelidade contratual, o cancelamento antecipado poderá implicar cobrança de multa proporcional, conforme previsto no CDC e na jurisprudência do STJ.
                </p>
            )
        },
        {
            icon: <Scale className="w-6 h-6 text-primary" />,
            title: "5. Limitação de Responsabilidade",
            content: (
                <p className="text-sm">
                    O Clube não se responsabiliza por interrupções temporárias decorrentes de manutenção ou atos de terceiros, garantindo o equilíbrio contratual em linha com a jurisprudência do STJ.
                </p>
            )
        },
        {
            icon: <Copyright className="w-6 h-6 text-primary" />,
            title: "6. Propriedade Intelectual",
            content: (
                <p className="text-sm">
                    Todos os conteúdos, marcas e logotipos são protegidos pela Lei de Direitos Autorais e pela Lei de Propriedade Industrial. É vedada a reprodução não autorizada.
                </p>
            )
        },
        {
            icon: <Lock className="w-6 h-6 text-primary" />,
            title: "7. Privacidade e Proteção de Dados",
            content: (
                <p className="text-sm">
                    O tratamento de dados pessoais observará a LGPD, conforme nossa Política de Privacidade. O associado declara ciência e concordância.
                </p>
            )
        },
        {
            icon: <Edit3 className="w-6 h-6 text-primary" />,
            title: "8. Alterações dos Termos",
            content: (
                <p className="text-sm">
                    O Clube poderá alterar estes Termos a qualquer tempo para adequação legal. Alterações relevantes serão comunicadas antecipadamente.
                </p>
            )
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO
                title="Termos de Uso"
                description="Leia nossos termos de uso para entender as regras e condições de utilização dos serviços do Clube Aqui Tem."
            />
            <Header />

            <section className="pt-32 pb-16 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium mb-6 border border-white/20">
                            <FileText className="w-4 h-4 text-accent" />
                            Contrato de Adesão e Termos Legais
                        </div>
                        <h1 className="text-4xl md:text-5xl font-brand font-bold text-white mb-4">
                            Termos de <span className="text-accent underline underline-offset-8 decoration-accent/30">Uso</span>
                        </h1>
                        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
                            Regras claras para garantir a melhor experiência para você e sua família.
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="flex-grow container mx-auto px-4 -mt-8 pb-24 relative z-20">
                <div className="max-w-4xl mx-auto space-y-6">
                    <p className="text-sm text-center mb-8 text-muted-foreground font-medium">Última atualização: Janeiro de 2026</p>

                    {sections.map((section, idx) => (
                        <motion.section
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-border hover:border-primary/20 transition-colors"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    {section.icon}
                                </div>
                                <h2 className="text-xl font-brand font-bold text-primary">{section.title}</h2>
                            </div>
                            <div className="text-foreground/80 leading-relaxed font-body">
                                {section.content}
                            </div>
                        </motion.section>
                    ))}

                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/5 p-8 rounded-2xl border-2 border-primary/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Gavel className="w-20 h-20 text-primary" />
                        </div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                <Gavel className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-brand font-bold text-primary">9. Foro e Solução de Conflitos</h2>
                        </div>
                        <div className="space-y-4 relative z-10 text-sm md:text-base text-foreground/80">
                            <p>Este contrato será regido pela legislação brasileira. As partes elegem o foro da sede do Clube como competente.</p>
                            <div className="bg-white/50 p-4 rounded-lg border border-primary/10 italic">
                                "O Clube poderá propor solução de conflitos por mediação ou arbitragem, conforme a Lei nº 9.307/1996, buscando celeridade e segurança jurídica."
                            </div>
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Termos;
