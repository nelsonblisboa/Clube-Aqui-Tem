import { useState } from "react";
import { motion } from "framer-motion";
import emailjs from '@emailjs/browser';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Mail, Phone, MapPin, Send, MessageCircle, MessageSquare } from "lucide-react";

const Contato = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Configuração EmailJS
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_xd1pneh';
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_c8gcvvp';
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'F5ReIEPz-YcjkuInF';

            // Inicializar EmailJS
            emailjs.init(publicKey);

            // Preparar dados do template
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                phone: formData.phone || 'Não informado',
                subject: formData.subject,
                message: formData.message,
                to_email: 'clubeaquitem.comercial@gmail.com'
            };

            // Enviar email
            const result = await emailjs.send(serviceId, templateId, templateParams);

            if (result.status === 200) {
                toast.success("Mensagem enviada com sucesso!", {
                    description: "Recebemos sua mensagem e entraremos em contato em breve."
                });

                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: ""
                });
            }

        } catch (error: any) {
            console.error("Erro ao enviar email:", error);

            // FALLBACK
            toast.error("Não foi possível enviar via email automático", {
                description: "Vamos te redirecionar para o WhatsApp."
            });

            const mensagemWhatsApp = `*Contato via Site*\n*Nome:* ${formData.name}\n*Mensagem:* ${formData.message}`;

            setTimeout(() => {
                window.open(`https://wa.me/5521964168479?text=${encodeURIComponent(mensagemWhatsApp)}`, '_blank');
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO
                title="Contato"
                description="Entre em contato com o Clube Aqui Tem. Estamos prontos para tirar suas dúvidas e ajudar você."
            />
            <Header />

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-primary relative overflow-hidden">
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
                            <MessageSquare className="w-4 h-4 text-accent" />
                            Atendimento Prioritário ao Cliente
                        </div>
                        <h1 className="text-4xl md:text-5xl font-brand font-bold text-white mb-6">
                            Estamos Aqui para <span className="text-accent underline underline-offset-8 decoration-accent/30">Ouvir Você</span>
                        </h1>
                        <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
                            Dúvidas, sugestões ou suporte? Nossa equipe está preparada para oferecer o melhor atendimento.
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="flex-grow container mx-auto px-4 -mt-10 pb-24 relative z-20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {/* Informações de Contato */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="border border-border shadow-sm hover:border-primary/30 transition-all hover:shadow-md bg-white text-center p-6 h-full">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-2">E-mail Oficial</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Envie sua solicitação para nosso suporte técnico.
                                </p>
                                <a
                                    href="mailto:clubeaquitem.comercial@gmail.com"
                                    className="text-primary hover:text-accent font-bold text-sm break-all transition-colors"
                                >
                                    clubeaquitem.comercial@gmail.com
                                </a>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border border-border shadow-sm hover:border-accent/30 transition-all hover:shadow-md bg-white text-center p-6 h-full">
                                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <MessageCircle className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-2">Chat em Tempo Real</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Suporte imediato através do nosso chat inteligente.
                                </p>
                                <p className="text-sm font-medium text-accent">
                                    Disponível no canto da tela
                                </p>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="border border-border shadow-sm hover:border-green-500/30 transition-all hover:shadow-md bg-white text-center p-6 h-full">
                                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <Phone className="w-7 h-7 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-2">WhatsApp</h3>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Fale diretamente com um consultor pelo WhatsApp.
                                </p>
                                <a
                                    href="https://wa.me/5521964168479"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-700 font-bold text-lg transition-colors"
                                >
                                    (21) 96416-8479
                                </a>
                            </Card>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border border-border shadow-xl rounded-3xl overflow-hidden bg-white">
                            <div className="bg-primary/5 p-8 border-b border-border text-center md:text-left">
                                <h2 className="text-2xl font-brand font-bold text-primary">Envie sua Mensagem</h2>
                                <p className="text-muted-foreground mt-2">
                                    Preencha o formulário abaixo e retornaremos em até 24 horas úteis.
                                </p>
                            </div>
                            <CardContent className="p-8 md:p-12">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="font-bold text-primary">Nome Completo *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Como gostaria de ser chamado?"
                                                className="h-12 rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="font-bold text-primary">E-mail *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="exemplo@email.com"
                                                className="h-12 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="font-bold text-primary">Telefone (Opcional)</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="(00) 00000-0000"
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subject" className="font-bold text-primary">Assunto *</Label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="Sobre o que você quer falar?"
                                                className="h-12 rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="font-bold text-primary">Sua Mensagem *</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Descreva detalhadamente como podemos te ajudar..."
                                            rows={6}
                                            className="rounded-xl pt-4"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="hero"
                                        className="w-full h-14 text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
                                        disabled={loading}
                                    >
                                        {loading ? "Enviando para nossa equipe..." : "Enviar Mensagem Agora"}
                                        <Send className="ml-2 w-5 h-5" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contato;
