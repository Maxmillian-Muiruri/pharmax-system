import { HeroSection } from "../components/HeroSection";
import { TrustBar } from "../components/TrustBar";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { PromotionsSection } from "../components/PromotionsSection";
import { ServicesSection } from "../components/ServicesSection";
import { CategoriesSection } from "../components/CategoriesSection";
import { TrendingSection } from "../components/TrendingSection";
import { ProductsSection } from "../components/ProductsSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { AppBannerSection } from "../components/AppBannerSection";
import { BlogSection } from "../components/BlogSection";
import { NewsletterSection } from "../components/NewsletterSection";

export const HomePage = () => {
  return (
    <main>
      <HeroSection />
      <TrustBar />
      <HowItWorksSection />
      <PromotionsSection />
      <ServicesSection />
      <CategoriesSection />
      <AppBannerSection />
      <TrendingSection />
      <ProductsSection />
      <TestimonialsSection />
      <BlogSection />
      <NewsletterSection />
    </main>
  );
};
