import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ReferralTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const ref = params.get("ref");

        if (ref) {
            const captureReferral = async () => {
                try {
                    const { data, error } = await supabase
                        .from("sellers" as any)
                        .select("id")
                        .eq("slug", ref)
                        .eq("status", "active")
                        .maybeSingle();

                    const res = data as any;
                    if (res && res.id) {
                        localStorage.setItem("clube_ref_seller_id", res.id);
                        console.log("Referral captured:", res.id);
                    }
                } catch (err) {
                    console.error("Error capturing referral:", err);
                }
            };

            captureReferral();
        }
    }, [location]);

    return null;
};

export default ReferralTracker;
