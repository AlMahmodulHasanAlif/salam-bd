// src/pages/Gallery/GalleryPage.jsx
import React, { useState, useEffect } from "react";
import { X, ZoomIn, Loader2 } from "lucide-react";

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery`);
        if (!res.ok) throw new Error("Failed to fetch gallery");
        const data = await res.json();
        setImages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const allTags = ["All", ...new Set(images.flatMap((img) => img.tags || []))];

  const filtered =
    activeTag === "All"
      ? images
      : images.filter((img) => img.tags?.includes(activeTag));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-primary-dark text-white py-14 px-6 text-center">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Our Gallery</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          Explore our collection of Islamic products, wall frames, books & more.
        </p>
      </div>

      {/* Tag Filter */}
      {allTags.length > 1 && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-3 flex gap-2 flex-wrap">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTag === tag
                    ? "bg-green-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-800"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-green-700" size={40} />
          </div>
        )}

        {error && (
          <div className="text-center py-24 text-red-500">
            <p className="text-lg font-medium">Could not load gallery</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg">No images found.</p>
          </div>
        )}

        {/* Masonry Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((img) => (
              <div
                key={img.publicId}
                className="break-inside-avoid group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => setLightbox(img)}
              >
                <img
                  src={img.secure_url}
                  alt={img.context?.caption || img.publicId}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/40 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow"
                    size={28}
                  />
                </div>
                {/* Caption */}
                {img.context?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-medium line-clamp-1">
                      {img.context.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow transition"
            >
              <X size={18} className="text-gray-700" />
            </button>
            <img
              src={lightbox.secure_url}
              alt={lightbox.context?.caption || lightbox.publicId}
              className="w-full max-h-[75vh] object-contain"
            />
            {(lightbox.context?.caption || lightbox.tags?.length > 0) && (
              <div className="p-4 border-t border-gray-100 bg-white">
                {lightbox.context?.caption && (
                  <p className="text-gray-700 font-medium text-sm">
                    {lightbox.context.caption}
                  </p>
                )}
                {lightbox.tags?.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {lightbox.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;