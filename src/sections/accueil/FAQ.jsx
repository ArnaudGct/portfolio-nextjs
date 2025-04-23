"use client";
import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const [questions, setQuestions] = useState([]);
  const [openIndex, setOpenIndex] = useState(null); // Ajout de l'état openIndex pour savoir quel élément est ouvert

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/accueil/faq");
        const data = await res.json();
        console.log("✅ Questions reçues :", data);
        setQuestions(data);
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des questions :",
          error
        );
      }
    };

    fetchQuestions();
  }, []);

  // Fonction pour gérer l'ouverture/fermeture des éléments
  const onOpenChange = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="flex flex-col lg:flex-row gap-8 w-[90%] mt-20 max-w-[1440px] mx-auto">
      <div>
        <p className="text-blue-600 text-3xl font-extrabold font-rethink-sans">
          Questions fréquentes
        </p>
        <p className="text-blue-900 font-normal">
          Voici les questions les plus fréquemment posées. Si vous avez d'autres
          questions, n'hésitez pas à me contacter.
        </p>
      </div>
      <div className="w-full space-y-2">
        {questions.map((question, index) => (
          <div
            key={question.id_faq}
            className="border border-blue-300 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => onOpenChange(index)} // Appel de onOpenChange pour gérer l'ouverture/fermeture
              className="w-full flex items-center justify-between p-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={false}
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {openIndex === index ? (
                    <Minus className="h-5 w-5 text-blue-700" />
                  ) : (
                    <Plus className="h-5 w-5 text-blue-700" />
                  )}
                </motion.div>
                <span className="text-left font-medium text-blue-900 font-rethink-sans">
                  {question.titre}
                </span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    transition: {
                      height: { duration: 0.3 },
                      opacity: { duration: 0.2 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.2 },
                      opacity: { duration: 0.1 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 pb-6 text-blue-900 text-normal font-normal"
                    dangerouslySetInnerHTML={{ __html: question.contenu }}
                  ></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
