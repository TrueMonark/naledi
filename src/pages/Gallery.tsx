import Navigation from '@/components/Navigation';
import HeroSlider from '@/components/HeroSlider';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import {API_BASE_URL, galleryApi} from '@/lib/api';

interface GalleryImage {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  tags: string[];
  createdAt: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const categories = ['Campus', 'Students', 'Events', 'Facilities', 'Sports', 'Academic'];

  useEffect(() => {
    fetchImages();
  }, [currentPage, selectedCategory]);

  const fetchImages = async () => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await galleryApi.getAll(currentPage, 12, selectedCategory);

      if (response.success) {
        if (currentPage === 1) {
          setImages(response.data.images);
        } else {
          setImages(prev => [...prev, ...response.data.images]);
        }
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error || 'Failed to fetch gallery images');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch gallery images');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const loadMoreImages = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="h-96">
          <HeroSlider />
        </div>
        <div className="flex justify-center items-center py-20">
          <Loading size="lg" text="Loading gallery..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="h-96">
          <HeroSlider />
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <div className="h-96">
        <HeroSlider />
      </div>

      {/* Filter Section */}
      <section className="py-8 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">School Gallery</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the vibrant life at Naledi Day and Boarding School through our photo gallery
            </p>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No images found.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {images.map((image) => (
                  <Dialog key={image._id}>
                    <DialogTrigger asChild>
                      <div
                        className="group relative overflow-hidden rounded-lg bg-card shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <div className="aspect-square overflow-hidden">
                            <img
                                src={`${API_BASE_URL}${image.imageUrl}`}
                                alt={image.title || 'Gallery Image'}
                                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="text-xs">
                            {image.category}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Eye className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white font-medium text-sm line-clamp-2">
                            {image.title}
                          </h3>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-primary">{image.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={image.imageUrl}
                            alt={image.title}
                            className="w-full max-h-96 object-contain rounded-lg"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{image.category}</Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(image.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {image.description && (
                          <p className="text-muted-foreground">{image.description}</p>
                        )}

                        {image.tags.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            {image.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="text-center mt-12">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={loadMoreImages}
                    disabled={loadingMore}
                  >
                    {loadingMore ? <Loading size="sm" text="Loading..." /> : "Load More Images"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;