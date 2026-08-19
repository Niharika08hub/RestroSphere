import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import About from "../components/About/About";
import WhyChoose from "../components/WhyFeatures/WhyChoose";
import Testimonials from "../components/Testimonials/Testimonials";
import RestaurantStats from "../components/RestaurantStats/RestaurantStats";
import Footer from "../components/Footer/Footer";

function Home() {
  const location = useLocation();

  useEffect(() => {
  const section = (location.state as any)?.section;

  if (section) {
    setTimeout(() => {
      document.getElementById(section)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // state clear
      window.history.replaceState({}, "");
    }, 300);
  }
}, [location]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <Navbar />

      <Hero />

      <About />

      <WhyChoose />

      <Testimonials />

      <RestaurantStats />

      <Footer />
    </motion.div>
  );
}

export default Home;