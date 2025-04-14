"use client";
import { useEffect, useState } from "react";

export default function LastVideos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Vidéos reçues :", data);
        setVideos(data);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {videos.map((video) => {
        const youtubeId = new URL(video.lien).searchParams.get("v");

        return (
          <div key={video.id} className="p-4 border rounded shadow bg-white">
            <h3 className="text-lg font-semibold mb-2">{video.titre}</h3>
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={video.titre}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        );
      })}
    </div>
  );
}
