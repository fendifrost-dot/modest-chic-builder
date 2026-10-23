import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeoHead from "@/components/SeoHead";
import PreorderSection from "@/components/PreorderSection";
import { pageTitle } from "@/lib/site";

const WhatsToCome = () => (
  <div className="min-h-screen bg-background">
    <SeoHead
      title={pageTitle("What's to Come")}
      description="Pre-order upcoming Modest pieces that are not in production and not in the Printify shop. Expected ship timing is shown only after the Founder writes it."
      path="/whats-to-come"
    />
    <Header />
    <main className="pt-32">
      <PreorderSection heading="h1" />
    </main>
    <Footer />
  </div>
);

export default WhatsToCome;
