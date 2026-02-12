import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Loader2, CheckCircle, Shield, ExternalLink, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ValidarAssinatura() {
    const [searchParams] = useSearchParams();
    // In a real scenario, these could be encoded in a token or session, but using params for simplicity as per request flow
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType");

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [success, setSuccess] = useState(false);
    const [link, setLink] = useState("");

    const handleSendOtp = async () => {
        if (!userId || !userType) {
            toast.error("Parâmetros inválidos");
            return;
        }

        setSendingOtp(true);
        try {
            // First, let's try to get the user's phone from the database
            const { data: user, error: userError } = await supabase
                .from(userType === 'subscriber' ? 'subscribers' : userType === 'partner' ? 'partner_accounts' : 'sellers' as any)
                .select('phone, telefone')
                .eq('id', userId)
                .single();

            if (userError || !user) throw new Error("Usuário não encontrado");
            const anyUser = user as any;
            const phone = anyUser.phone || anyUser.telefone;

            if (!phone) throw new Error("Telefone não cadastrado");

            const response = await fetch('/api/signatures/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, userType, phone })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setOtpSent(true);
                toast.success("Código enviado para seu WhatsApp!");
            } else {
                toast.error(data.error || "Erro ao enviar código");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao conectar com o servidor");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleValidate = async () => {
        if (!userId || !userType) {
            toast.error("Link inválido. Certifique-se de ter acessado o link correto enviando pelo sistema.");
            return;
        }
        if (otp.length !== 4) {
            toast.error("O código deve ter 4 dígitos");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/signatures/validate-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, userType, otp })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(true);
                setLink(data.link);
                toast.success("Código validado com sucesso!");
            } else {
                toast.error(data.error || "Código inválido ou expirado");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao conectar com o servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-md min-h-[80vh] flex items-center justify-center p-4 text-primary">
            <Card className="w-full shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="text-center bg-primary/5 pb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-brand font-bold text-primary">Assinatura Segura</CardTitle>
                    <CardDescription className="text-base">
                        {success
                            ? "Validação concluída"
                            : otpSent
                                ? "Insira o código de 4 dígitos enviado ao seu WhatsApp"
                                : "Para sua segurança, precisamos validar sua identidade."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-8 space-y-6">
                    {!success ? (
                        <>
                            {!otpSent ? (
                                <div className="space-y-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Clique no botão abaixo para receber um código de segurança via WhatsApp.
                                    </p>
                                    <Button
                                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-14 text-lg font-bold rounded-2xl shadow-lg transition-all"
                                        onClick={handleSendOtp}
                                        disabled={sendingOtp}
                                    >
                                        {sendingOtp ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enviar Código via WhatsApp"}
                                    </Button>
                                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                        <Smartphone className="w-3 h-3" /> Evolution API Protected
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center py-4">
                                        <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                                            <InputOTPGroup className="gap-2">
                                                <InputOTPSlot index={0} className="h-14 w-14 text-2xl font-bold border-2 rounded-xl focus:border-primary" />
                                                <InputOTPSlot index={1} className="h-14 w-14 text-2xl font-bold border-2 rounded-xl focus:border-primary" />
                                                <InputOTPSlot index={2} className="h-14 w-14 text-2xl font-bold border-2 rounded-xl focus:border-primary" />
                                                <InputOTPSlot index={3} className="h-14 w-14 text-2xl font-bold border-2 rounded-xl focus:border-primary" />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <div className="space-y-4">
                                        <Button
                                            className="w-full bg-primary hover:bg-primary/90 text-white h-14 text-lg font-bold rounded-2xl shadow-xl transition-all"
                                            onClick={handleValidate}
                                            disabled={loading || otp.length !== 4}
                                        >
                                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Validar Código"}
                                        </Button>
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={sendingOtp}
                                            className="w-full text-xs font-bold text-primary hover:underline"
                                        >
                                            Não recebeu? Clique para reenviar
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-black">
                                        O código expira em 15 minutos
                                    </p>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="flex justify-center">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-brand font-bold text-primary">Tudo pronto!</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Sua identidade foi validada com sucesso. Clique no botão abaixo para abrir o portal de assinatura.
                                </p>
                            </div>
                            <Button asChild className="w-full bg-green-600 hover:bg-green-700 h-16 text-xl font-bold rounded-2xl shadow-xl shadow-green-200 group">
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                    Assinar Contrato
                                    <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
