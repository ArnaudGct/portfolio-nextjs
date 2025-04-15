import TagAvailable from "./../../components/TagAvailable";
import TagSocialMedia from "./../../components/TagSocialMedia";
import ButtonMain from "./../../components/ButtonMain";
import { Phone, Send } from "lucide-react";
import Image from "next/image";
import Tag from "./../../components/Tag";

export default function Contact() {
  return (
    <section className="flex flex-col gap-12 lg:flex-row items-start lg:items-center justify-center lg:justify-between w-[90%] mt-36 mb-20 mx-auto max-w-[1440px]">
      {/* <div>
        <h2 className="text-4xl font-bold mb-8">Contact</h2>
      <p className="text-lg mb-4">
        Pour toute question ou demande, n'hésitez pas à nous contacter.
      </p>
      </div> */}
      <div className="w-full flex flex-col gap-8 items-start justify-start">
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
              <TagAvailable />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-row lg:flex-col gap-8 items-start justify-start">
          <div className="w-full sm:w-[40%] lg:w-full flex flex-wrap gap-2">
            <TagSocialMedia name="mail" />
            <TagSocialMedia name="instagram" />
            <TagSocialMedia name="linkedin" />
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

      <form className="flex flex-col gap-6 w-full p-9 bg-slate-50 rounded-lg">
        <div>
          <p className="text-blue-600 text-2xl font-extrabold font-rethink-sans">
            Contact
          </p>
          <p className="text-blue-900">
            Pour toute question ou collaboration, n'hésitez pas à me contacter.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="w-full flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Prénom"
              className="w-full py-2 px-4 bg-slate-200 rounded-lg"
            />
            <input
              type="text"
              placeholder="Nom"
              className="w-full py-2 px-4 bg-slate-200 rounded-lg"
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            className="w-full py-2 px-4 bg-slate-200 rounded-lg"
          />
          <textarea
            placeholder="Message"
            className="w-full py-2 px-4 bg-slate-200 rounded-lg h-48"
          ></textarea>
        </div>

        <ButtonMain
          icon={<Send size={16} strokeWidth={1.75} />}
          size="base"
          className="w-full xs:w-auto"
        >
          Envoyer le message
        </ButtonMain>
      </form>
    </section>
  );
}
