import Tag from "./../../src/components/Tag";

export default function Prix() {
  return (
    <main className="bg-white">
      <div className="flex flex-col w-[90%] mx-auto max-w-[1440px] gap-10 pt-24 pb-20">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-3xl font-extrabold font-rethink-sans text-blue-600">
              Estimations des tarifs
            </p>
            <p className="text-lg/8 text-blue-900">
              Ces tarifs sont à titre indicatifs et sont adaptés selon le type
              de projet.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
            <div className="flex w-full flex-col gap-2 overflow-hidden md:flex-row">
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783521629/compressO--L0Gq5e6Zk9THaIkFLfWV_sgnkb0.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783521629/compressO-Motion_Acade%CC%81mie_en_ligne_te93q6.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783521630/compressO-Motion_AQuatre_f5mmfq.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-blue-600 text-2xl font-extrabold font-rethink-sans">
                Motion design
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Tag name="Entre 300€ et 500€" background={true} />
                <Tag name="1min" background={true} />
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
            <div className="flex w-full flex-col gap-2 overflow-hidden md:flex-row">
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544134/compressO-FaceCam_Motion_Boxing_Culture_oj9ege.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544134/compressO-FaceCam_Motion_Warren_Buffett_zgm2sb.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544133/compressO-FaceCam_Motion_AI_Project_j3slya.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-blue-600 text-2xl font-extrabold font-rethink-sans">
                Facecam + Zooms + Motion design
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Tag name="Entre 200€ et 300€" background={true} />
                <Tag name="1min" background={true} />
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
            <div className="flex w-full flex-col gap-2 overflow-hidden md:flex-row">
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544122/compressO-FaceCam_B-Roll_Buffett_t02pzy.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544122/compressO-FaceCam_B-Roll_Fin_ChatGPT_cb2ovx.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544122/compressO-FaceCam_B-Roll_Chine_pjj1ex.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-blue-600 text-2xl font-extrabold font-rethink-sans">
                Facecam + Zooms + B-Roll
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Tag name="Entre 100€ et 200€" background={true} />
                <Tag name="1min" background={true} />
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
            <div className="flex w-full flex-col gap-2 overflow-hidden md:flex-row">
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544145/compressO-FaceCam_Zooms_Google_y1sdcu.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544767/compressO-FaceCam_Zooms_Kasper_gqyqej.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544144/compressO-FaceCam_Zooms_Berline_allemande_atelra.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-blue-600 text-2xl font-extrabold font-rethink-sans">
                Facecam + Zooms
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Tag name="Environ 80€" background={true} />
                <Tag name="1min" background={true} />
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
            <div className="flex w-full flex-col gap-2 overflow-hidden md:flex-row">
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544102/compressO-Coupes_Vlog_Enzo_g4g178.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544102/compressO-Coupes_Theyo_awuyfh.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
              <video
                src="https://res.cloudinary.com/dx0k6xzqa/video/upload/v1783544102/compressO-Coupes_Elliott_tsklqm.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-auto w-full min-w-0 rounded-lg object-cover md:flex-1 md:basis-0"
              ></video>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-blue-600 text-2xl font-extrabold font-rethink-sans">
                Coupes de silences, raccord de plans, synchronisation, multicam
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Tag name="Environ 15€" background={true} />
                <Tag name="1min" background={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-14 bg-linear-to-t from-blue-100/0 to-blue-100/75 pointer-events-none"></div>
    </main>
  );
}
