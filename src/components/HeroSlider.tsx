import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroCampus from '@/assets/hero-campus.jpg';
import heroStudents from '@/assets/hero-students.jpg';
import heroGraduation from '@/assets/hero-graduation.jpg';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  cta?: string;
}

const slides: Slide[] = [
  {
    image: heroCampus,
    title: "Welcome to Naledi Day and Boarding School",
    subtitle: "Nurturing Excellence, Building Future Leaders",
    cta: "Explore Our Programs"
  },
  {
    image: heroStudents,
    title: "Academic Excellence",
    subtitle: "Empowering Students Through Quality Education",
    cta: "Learn More"
  },
  {
    image: heroGraduation,
    title: "Celebrating Success",
    subtitle: "Your Journey to Achievement Starts Here",
    cta: "Join Our Community"
  }
];

interface HeroSliderProps {
  onCtaClick?: () => void;
}

const HeroSlider = ({ onCtaClick }: HeroSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-overlay" />
          
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl mx-auto px-6">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 animate-fadeInUp delay-200">
                {slide.subtitle}
              </p>
              {slide.cta && (
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={onCtaClick}
                  className="animate-fadeInUp delay-500"
                >
                  {slide.cta}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;