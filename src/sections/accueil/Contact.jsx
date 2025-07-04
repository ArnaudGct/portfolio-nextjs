"use client";

import { useState, useEffect } from "react";
import TagAvailable from "./../../components/TagAvailable";
import TagSocialMedia from "./../../components/TagSocialMedia";
import ButtonMain from "./../../components/ButtonMain";
import { Phone, Send, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [formState, setFormState] = useState({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    message: "",
  });

  useEffect(() => {
    if (formState.isSuccess) {
      const timer = setTimeout(() => {
        setFormState((prev) => ({
          ...prev,
          isSuccess: false,
          message: "",
        }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [formState.isSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormState({
      isSubmitting: true,
      isSuccess: false,
      isError: false,
      message: "",
    });

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFormState({
          isSubmitting: false,
          isSuccess: true,
          isError: false,
          message: "Message envoyé avec succès !",
        });
        setFormData({ firstName: "", lastName: "", email: "", message: "" });
      } else {
        throw new Error(result.error?.message || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire:", error);
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        message: error.message || "Une erreur est survenue.",
      });
    }
  };

  return (
    <section className="flex flex-col gap-12 lg:flex-row items-start lg:items-center justify-center lg:justify-between max-w-[1440px] w-full sm:w-[90%] sm:mx-auto">
      <div className="w-[90%] mx-auto sm:w-full flex flex-col gap-8 items-start justify-start">
        <div className="flex gap-4 items-center justify-start">
          <Image
            src="/arnaud_graciet_pp.webp"
            alt="Arnaud Graciet qui sourit"
            width={90}
            height={90}
            className="rounded-lg"
          />
          <div className="flex flex-col gap-2 items-start justify-start">
            <div>
              <p className="text-blue-600 text-3xl font-normal font-rethink-sans">
                Arnaud <span className="font-extrabold">Graciet</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TagAvailable href="https://cal.com/arnaudgct/prise-de-contact" />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-row lg:flex-col gap-8 items-start justify-start">
          <div className="w-full sm:w-[40%] lg:w-full flex flex-wrap gap-2">
            <TagSocialMedia name="mail" />
            <TagSocialMedia name="instagram" />
            <TagSocialMedia name="linkedin" />
            <TagSocialMedia name="x" />
          </div>
          <div className="w-full sm:w-[60%] lg:w-auto flex flex-col gap-4 items-start justify-start p-7 bg-blue-50 border border-blue-300 rounded-lg">
            <div>
              <p className="text-blue-600 text-xl font-bold font-rethink-sans">
                Besoin de discuter ?
              </p>
              <p className="text-blue-900">
                Planifiez une réunion en un clic avec Cal.com
              </p>
            </div>
            <ButtonMain
              icon={<Phone size={16} strokeWidth={1.75} />}
              size="base"
              link="https://cal.com/arnaudgct/prise-de-contact"
              newTab={true}
              className="w-full xs:w-auto"
            >
              Réserver un appel
            </ButtonMain>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-50 dark:bg-blue-50 w-full pt-9 pb-9 sm:p-9 rounded-none sm:rounded-lg"
      >
        <div className="flex flex-col gap-6 w-[90%] sm:w-full mx-auto">
          <div>
            <p className="text-blue-600 text-2xl font-extrabold font-rethink-sans">
              Contact
            </p>
            <p className="text-blue-900">
              Pour toute question ou collaboration, n'hésitez pas à me
              contacter.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="w-full flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full py-2 px-4 bg-slate-200 dark:bg-blue-100 dark:text-blue-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={formState.isSubmitting || formState.isSuccess}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Nom"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full py-2 px-4 bg-slate-200 dark:bg-blue-100 dark:text-blue-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={formState.isSubmitting || formState.isSuccess}
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full py-2 px-4 bg-slate-200 dark:bg-blue-100 dark:text-blue-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={formState.isSubmitting || formState.isSuccess}
            />
            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              className="w-full py-2 px-4 bg-slate-200 dark:bg-blue-100 dark:text-blue-950 rounded-lg h-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={formState.isSubmitting || formState.isSuccess}
            />
          </div>

          <div className="flex flex-col gap-2 items-start justify-start">
            <ButtonMain
              icon={
                formState.isSuccess ? (
                  <CheckCircle size={16} strokeWidth={1.75} />
                ) : (
                  <Send size={16} strokeWidth={1.75} />
                )
              }
              size="base"
              className={`w-full xs:w-auto ${
                formState.isSuccess ? "bg-green-600" : ""
              }`}
              type="submit"
              disabled={formState.isSubmitting || formState.isSuccess}
            >
              {formState.isSubmitting
                ? "Envoi en cours..."
                : formState.isSuccess
                  ? "Message envoyé !"
                  : "Envoyer le message"}
            </ButtonMain>

            {formState.isError && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle size={16} strokeWidth={1.75} />
                <p className="text-sm">{formState.message}</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
