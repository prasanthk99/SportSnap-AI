'use client';
import { useEffect, useRef, useState } from 'react';

export default function Reels() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [celebrity, setCelebrity] = useState("");
  const videoRefs = useRef([]);
  const [videoPlaying, setVideoPlaying] = useState(Array(videos.length).fill(false));

  const fetchVideos = async () => {
    const res = await fetch('/api/videos');
    const data = await res.json();
    setVideos(data.videos || []);
    console.log(data);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.9,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play();
          setVideoPlaying((prev) => {
            const updated = [...prev];
            updated[entry.target.dataset.index] = true;
            return updated;
          });
        } else {
          video.pause();
          setVideoPlaying((prev) => {
            const updated = [...prev];
            updated[entry.target.dataset.index] = false;
            return updated;
          });
        }
      });
    }, observerOptions);

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [videos]);

  const handleGenerate = async () => {
    if (!celebrity) return alert("Enter a sports person name!");

    setLoading(true);
    const res = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ celebrity }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      await fetchVideos();
    } else {
      alert("Failed to generate reel");
    }
  };

  const handlePlayPause = (idx) => {
    const video = videoRefs.current[idx];
    if (videoPlaying[idx]) {
      video.pause();
      setVideoPlaying((prev) => {
        const updated = [...prev];
        updated[idx] = false;
        return updated;
      });
    } else {
      video.play();
      setVideoPlaying((prev) => {
        const updated = [...prev];
        updated[idx] = true;
        return updated;
      });
    }
  };

  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white">
      
      <div className="sticky top-0 z-50 bg-black p-4 flex flex-wrap gap-2 items-center">
        <input
          value={celebrity}
          onChange={(e) => setCelebrity(e.target.value)}
          placeholder="Enter sports person name"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex-1"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-green-500 text-black font-bold px-4 py-2 rounded-lg"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="h-screen flex items-center justify-center text-white">
          <div className="text-center">
            <p className="text-xl mb-4">No videos available yet!</p>
            <p className="text-lg">Please generate videos by entering a sports person name.</p>
          </div>
        </div>
      ) : (
        // Video Reels
        videos.map((video, idx) => (
          <section
            key={idx}
            className="snap-start flex items-center justify-center h-screen w-full relative"
          >
            <video
              ref={(el) => (videoRefs.current[idx] = el)}
              src={video.videoUrl}
              loop
              // muted
              playsInline
              className="h-full w-full object-cover"
              data-index={idx}
            />

            {!videoPlaying[idx] && (
              <div
                onClick={() => handlePlayPause(idx)}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl cursor-pointer"
              >
                &#9654;
              </div>
            )}


            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

            <div className="absolute bottom-6 left-4 z-20 text-white px-2">
              <h2 className="text-2xl font-semibold mb-1 drop-shadow-md">{video.title}</h2>
              <p className="text-sm text-gray-300 drop-shadow-md">@{video.celebrity}</p>
            </div>
          </section>
        ))
      )}
    </main>
  );
}