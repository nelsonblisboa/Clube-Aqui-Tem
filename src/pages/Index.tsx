import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import PartnerForm from "@/components/PartnerForm";
import LoginArea from "@/components/LoginArea";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <PartnerForm />
        <LoginArea />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
