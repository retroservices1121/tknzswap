import { Nav } from "@/components/layout/Nav";
import { InfraTopbar } from "@/components/layout/InfraTopbar";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <InfraTopbar />
      {children}
      <Footer />
    </>
  );
}
