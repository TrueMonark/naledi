import Navigation from "@/components/Navigation";
import HeroSlider from "@/components/HeroSlider";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { galleryApi, API_BASE_URL } from "@/lib/api";
import RequirementsCard from "@/components/RequirementsCard";

const Requirements = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await galleryApi.getAll();

        // response is like { images: [...], totalPages: 1, ... }
        if (response && Array.isArray(response.images)) {
          setGalleryImages(response.images);
        } else {
          console.warn(
            "Gallery images response does not contain an array:",
            response
          );
          setGalleryImages([]);
        }
      } catch (err) {
        console.error("Failed to load gallery images:", err);
        setGalleryImages([]);
      } finally {
        setLoadingGallery(false);
      }
    };

    fetchGallery();
  }, []);

  const downloadPDF = (fileName: string) => {
    const link = document.createElement("a");
    link.href = `/files/${fileName}.pdf`; // Adjust path based on where your files are hosted
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}

      <HeroSlider />

      {/* Requirements Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Admission Requirements
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Download our admission documents to learn about the requirements
              for joining Naledi Day and Boarding School
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <RequirementsCard
              title="Primary School Requirements"
              description="School requirements for primary school admission."
              downloadKey="PRIMARY SCHOOL REQUIREMENTS"
              onDownload={downloadPDF}
            />

            <RequirementsCard
              title="Secondary School Requirements"
              description="School requirements for secondary school admission."
              downloadKey="SECONDARY SCHOOL REQUIREMENTS"
              onDownload={downloadPDF}
            />

            <RequirementsCard
              title="Boarding Requirements for All Students"
              description="Includes boarding fees, stationery lists, and other additional costs."
              downloadKey="BOARDING REQUIREMENTS"
              onDownload={downloadPDF}
            />
          </div>
        </div>
      </section>

      {/* School Gallery Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              School Gallery
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take a visual tour of our beautiful campus, modern facilities, and
              vibrant student life
            </p>
          </div>

          {loadingGallery ? (
            <p className="text-center">Loading gallery images...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => (
                <div
                  key={image._id || index}
                  className="relative group overflow-hidden rounded-lg shadow-card hover:shadow-elegant transition-all duration-300">
                  <img
                    src={`${API_BASE_URL}${image.imageUrl}`}
                    alt={image.title || `Gallery image ${index + 1}`}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `${API_BASE_URL}${image.imageUrl}`,
                          "_blank"
                        )
                      }>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      View Full Size
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button variant="secondary" size="lg">
              View More Photos
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Requirements;
