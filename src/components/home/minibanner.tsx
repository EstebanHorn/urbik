import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import minibanner1 from "../../assets/minibanner/minibanner1.png";
import minibanner2 from "../../assets/minibanner/minibanner2.png";

const bannersData = [
  {
    id: 1,
    image: minibanner1,
    text: "Esta es tu oportunidad",
    subtext: "Publicá y vendé en un instante",
  },
  {
    id: 2,
    image: minibanner2,
    text: "Descubrí tu próximo hogar",
    subtext: "Encontra tu propiedad ideal en Urbik",
  }
];

export default function MiniBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? 1 : 0));
    }, 5000); 

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-40 md:h-[200px] bg-urbik-black mt-5 rounded-2xl relative overflow-hidden flex justify-start items-center text-white text-left shadow-lg px-6 md:px-12">
      
      <AnimatePresence mode="wait">
        <motion.div
          key={bannersData[currentIndex].id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={bannersData[currentIndex].image}
            alt={`Banner ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-sm md:max-w-md lg:max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide drop-shadow-md">
              {bannersData[currentIndex].text}
            </h1>
            {bannersData[currentIndex].subtext && (
              <p className="text-sm md:text-base lg:text-lg drop-shadow-md text-gray-100">
                {bannersData[currentIndex].subtext}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
    </div>
  );
}