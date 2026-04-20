import Navigation from "@/components/Navigation";
import HeroSlider from "@/components/HeroSlider";
import Footer from "@/components/Footer";
import { Quote, Heart, Calendar, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { API_BASE_URL, devotionApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";

interface Devotion {
  _id: string;
  title: string;
  verse: string;
  reference: string;
  message: string;
  author: string;
  image: string;
  isActive: boolean;
  scheduledDate: string;
  createdAt: string;
}

const Devotion = () => {
  const [selectedDevotion, setSelectedDevotion] = useState<Devotion | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDevotion, setCurrentDevotion] = useState<Devotion | null>(null);
  const [previousDevotions, setPreviousDevotions] = useState<Devotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDevotions();
  }, []);

  const fetchDevotions = async () => {
    try {
      setLoading(true);
      setError(null);

      const current = await devotionApi.getCurrent();
      const previous = await devotionApi.getPrevious(1, 6);

      console.log("Current:", current);
      console.log("Previous:", previous);

      if (current) {
        setCurrentDevotion(current.data || current); // support both cases
      }

      if (previous) {
        setPreviousDevotions(
          previous.data?.devotions || previous.devotions || []
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch devotions.");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch devotions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDevotionClick = (devotion: Devotion) => {
    setSelectedDevotion(devotion);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="h-96">
          <HeroSlider />
        </div>
        <section className="py-16 bg-background">
          <Loading className="py-20" size="lg" text="Loading devotions..." />
        </section>
        <Footer />
      </div>
    );
  }

  if (error || !currentDevotion) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <HeroSlider />
        <section className="py-16 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-muted-foreground mb-4">
              No devotion available for today
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
              Try Again
            </button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}

      <HeroSlider />

      {/* Devotion Section */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Daily Devotion
            </h2>
            <p className="text-lg text-muted-foreground">
              Finding inspiration and guidance through faith and reflection
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-elegant overflow-hidden">
            {/* Devotion Image */}
            <div className="relative h-80 overflow-hidden">
              <img
                src={`${API_BASE_URL}${currentDevotion.image}`}
                alt="Devotion"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-overlay" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center text-white space-x-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(currentDevotion.scheduledDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Today's Reflection
                </h3>
              </div>
            </div>

            {/* Bible Verse */}
            <div className="p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="text-center">
                <Quote className="h-8 w-8 text-secondary mx-auto mb-4" />
                <blockquote className="text-2xl font-semibold text-primary mb-4 italic leading-relaxed">
                  "{currentDevotion.verse}"
                </blockquote>
                <cite className="text-lg text-secondary font-semibold">
                  - {currentDevotion.reference}
                </cite>
              </div>
            </div>

            {/* Devotion Message */}
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                {currentDevotion.message
                  .split("\n\n")
                  .map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-muted-foreground leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary">
                        {currentDevotion.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        School Chaplain
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Blessings and Peace
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Devotions */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-primary mb-6">
              Previous Devotions
            </h3>
            {previousDevotions.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {previousDevotions.map((devotionItem) => (
                  <div
                    key={devotionItem._id}
                    className="bg-white p-6 rounded-lg shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer hover:scale-105"
                    onClick={() => handleDevotionClick(devotionItem)}>
                    <div className="h-32 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={`${API_BASE_URL}${devotionItem.image}`}
                        alt={devotionItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-semibold text-primary mb-2">
                      {devotionItem.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {devotionItem.reference}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(devotionItem.scheduledDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No previous devotions available
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Devotion Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDevotion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">
                  {selectedDevotion.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Devotion Image */}
                <div className="relative h-64 overflow-hidden rounded-lg">
                  <img
                    src={selectedDevotion.image}
                    alt={selectedDevotion.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-overlay" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center text-white space-x-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(
                          selectedDevotion.scheduledDate
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bible Verse */}
                <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                  <div className="text-center">
                    <Quote className="h-6 w-6 text-secondary mx-auto mb-3" />
                    <blockquote className="text-lg font-semibold text-primary mb-3 italic leading-relaxed">
                      "{selectedDevotion.verse}"
                    </blockquote>
                    <cite className="text-base text-secondary font-semibold">
                      - {selectedDevotion.reference}
                    </cite>
                  </div>
                </div>

                {/* Devotion Message */}
                <div className="prose prose-base max-w-none">
                  {selectedDevotion.message
                    .split("\n\n")
                    .map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-muted-foreground leading-relaxed mb-3">
                        {paragraph}
                      </p>
                    ))}
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary">
                        {selectedDevotion.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        School Chaplain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Devotion;
