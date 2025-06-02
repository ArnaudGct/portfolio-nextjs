"use client";
import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useRef } from "react";

export default function FAQ() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const parentRef = useRef(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (parentRef.current) {
      const links = parentRef.current.querySelectorAll("a[href^='http']");
      links.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });
    }
  }, []);

  // Fonction pour gérer l'ouverture/fermeture des éléments
  const onOpenChange = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const CustomLink = ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 underline hover:text-blue-500 transition-colors"
      {...props}
    >
      {children}
    </a>
  );

  return (
    <section className="flex flex-col lg:flex-row gap-8 w-[90%] max-w-[1440px] mx-auto">
      <div className="flex flex-col gap-2">
        <p className="text-blue-600 text-3xl font-extrabold font-rethink-sans">
          Questions fréquentes
        </p>
        <p className="text-blue-900 font-normal text-lg/8">
          Voici les questions les plus fréquemment posées. Si vous avez d'autres
          questions, n'hésitez pas à me contacter.
        </p>
      </div>
      <div className="w-full space-y-2">
        {isLoading ? (
          // Skeleton loader pendant le chargement
          <>
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                className="border border-blue-300 rounded-lg overflow-hidden"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <div className="p-4 flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-blue-200"></div>
                  <div className="h-6 bg-blue-200 rounded w-3/4"></div>
                </div>
              </motion.div>
            ))}
          </>
        ) : (
          // Contenu réel une fois chargé
          questions.map((question, index) => (
            <div
              key={question.id_faq}
              className="border border-blue-300 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => onOpenChange(index)}
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
                      className="px-4 pb-6 text-blue-900 text-normal font-normal [&_a]:text-blue-400 [&_a]:underline [&_a:hover]:text-blue-500 [&_a]:transition-colors"
                      ref={parentRef}
                      data-externallinks="true"
                    >
                      <ReactMarkdown
                        components={{
                          a: CustomLink,
                        }}
                      >
                        {question.contenu}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
