import { Footer } from "../components/layout/Footer/Footer";
import { Features } from "../components/main/Features/Features";
import { Hero } from "../components/main/Hero/Hero";
import { ThemeReset } from "../utils/ThemeReset";

export default function Home() {
  return (
    <main>
      <ThemeReset />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}