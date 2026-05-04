import { Hero } from "@/components/layout/Hero";
import { PriceTicker } from "@/components/layout/PriceTicker";
import { ArchitectureCards } from "@/components/framework/ArchitectureCards";

export default function HomePage() {
  return (
    <>
      <main className="page">
        <Hero />
      </main>
      <PriceTicker />
      <ArchitectureCards />
    </>
  );
}
