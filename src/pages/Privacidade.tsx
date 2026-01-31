import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    FileText,
    Database,
    Eye,
    Lock,
    UserCheck,
    RefreshCcw,
    Gavel,
    AlertTriangle,
    Info
} from "lucide-react";

const Privacidade = () => {
    const sections = [
        {
            icon: <Info className="w-6 h-6 text-primary" />,
            title: "1. Finalidade e Âmbito",
            content: (
                <>
                    <p className="mb-4">
                        Esta Política de Privacidade disciplina o tratamento de dados pessoais dos assinantes do Clube, em conformidade com:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <li className="flex gap-2">
                            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                            <span><strong>LGPD</strong> (Lei nº 13.709/2018)</span>
                        </li>
                        <li className="flex gap-2">
                            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                            <span><strong>Constituição Federal</strong> (art. 5º)</span>
                        </li>
                        <li className="flex gap-2">
                            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                            <span><strong>Código de Defesa do Consumidor</strong></span>
                        </li>
                        <li className="flex gap-2">
                            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                            <span><strong>Marco Civil da Internet</strong></span>
                        </li>
                    </ul>
                    <p className="mt-4 text-sm italic border-l-4 border-accent/30 pl-4 py-1 bg-accent/5">
                        Ao aderir ao Clube, o titular declara ciência e concordância com os termos aqui descritos.
                    </p>
                </>
            )
        },
        {
            icon: <Database className="w-6 h-6 text-primary" />,
            title: "2. Coleta de Dados Pessoais",
            content: (
                <p>
                    O Clube poderá coletar e tratar dados pessoais estritamente necessários para execução de suas atividades, observando os princípios da necessidade, finalidade, adequação e proporcionalidade previstos na LGPD.
                </p>
            )
        },
        {
            icon: <Eye className="w-6 h-6 text-primary" />,
            title: "3. Uso das Informações",
            content: (
                <>
                    <p className="mb-4">Os dados pessoais serão utilizados exclusivamente para:</p>
                    <ul className="space-y-2 mb-4">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span>Execução do contrato de assinatura</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span>Cumprimento de obrigações legais</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                            <span>Comunicação institucional e promocional</span>
                        </li>
                    </ul>
                    <p className="text-sm leading-relaxed">
                        O compartilhamento com terceiros ocorrerá apenas quando indispensável, mediante cláusulas contratuais de confidencialidade e proteção de dados, conforme exigido pela LGPD e pela jurisprudência do STJ.
                    </p>
                </>
            )
        },
        {
            icon: <RefreshCcw className="w-6 h-6 text-primary" />,
            title: "4. Armazenamento e Retenção",
            content: (
                <>
                    <p className="mb-4">A retenção observará os prazos legais, como:</p>
                    <div className="grid gap-3">
                        <div className="bg-secondary/30 p-3 rounded-lg flex items-start gap-3">
                            <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-sm block">Código Civil</span>
                                <span className="text-xs">Prazos prescricionais para exercício de direitos.</span>
                            </div>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-lg flex items-start gap-3">
                            <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold text-sm block">Legislação Fiscal</span>
                                <span className="text-xs">Guarda obrigatória de documentos por até 5 anos.</span>
                            </div>
                        </div>
                    </div>
                </>
            )
        },
        {
            icon: <Lock className="w-6 h-6 text-primary" />,
            title: "5. Segurança da Informação",
            content: (
                <p>
                    O Clube adota medidas técnicas e administrativas em conformidade com a <strong>Norma ISO/IEC 27001</strong> e resoluções da ANPD, garantindo a proteção contra incidentes em linha com a jurisprudência do STF.
                </p>
            )
        },
        {
            icon: <UserCheck className="w-6 h-6 text-primary" />,
            title: "6. Direitos dos Titulares",
            content: (
                <>
                    <p className="mb-3 text-sm">Nos termos da LGPD, o titular poderá exercer direitos como:</p>
                    <div className="flex flex-wrap gap-2">
                        {["Acesso", "Correção", "Exclusão", "Portabilidade", "Revogação"].map((direito) => (
                            <span key={direito} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                                {direito}
                            </span>
                        ))}
                    </div>
                </>
            )
        },
        {
            icon: <Gavel className="w-6 h-6 text-primary" />,
            title: "8. Foro e Legislação Aplicável",
            content: (
                <p className="text-sm">
                    Esta Política será regida pela legislação brasileira. Eventuais controvérsias serão dirimidas no foro da sede do Clube, com exclusão de qualquer outro.
                </p>
            )
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO
                title="Política de Privacidade"
                description="Conheça nossa política de privacidade e como tratamos seus dados pessoais em conformidade com a LGPD."
            />
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium mb-6 border border-white/20">
                            <ShieldCheck className="w-4 h-4 text-accent" />
                            Central de Privacidade e Segurança
                        </div>
                        <h1 className="text-4xl md:text-5xl font-brand font-bold text-white mb-4">
                            Sua Privacidade é Nossa <span className="text-accent underline underline-offset-8 decoration-accent/30">Prioridade</span>
                        </h1>
                        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
                            Tratamos seus dados com o rigor exigido pela LGPD e o respeito que sua família merece.
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="flex-grow container mx-auto px-4 -mt-8 pb-24 relative z-20">
                <div className="max-w-4xl mx-auto">
                    {/* Conteúdo Principal */}
                    <div className="space-y-6">
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

                        {/* Cláusula de Responsabilidade com estilo diferenciado */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-accent/5 p-8 rounded-2xl border-2 border-accent/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <AlertTriangle className="w-20 h-20 text-accent" />
                            </div>
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-brand font-bold text-primary">9. Cláusula de Responsabilidade</h2>
                            </div>
                            <div className="space-y-4 relative z-10 text-sm md:text-base">
                                <p className="font-medium text-primary">
                                    O Clube declara que adota todas as medidas técnicas razoáveis para proteger seus dados, todavia, o titular reconhece que:
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Nenhum sistema é 100% imune a ataques externos sofisticados.",
                                        "Não somos responsáveis por falhas de conexão ou eventos fora de nosso controle.",
                                        "A responsabilidade limita-se ao cumprimento das obrigações legais vigentes.",
                                        "Garantimos transparência imediata em caso de qualquer incidente de segurança."
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-3 items-start">
                                            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-accent text-xs font-bold">{i + 1}</span>
                                            </div>
                                            <span className="text-foreground/80">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Privacidade;
