import Navigation from '@/components/Navigation';
import HeroSlider from '@/components/HeroSlider';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Play, Award, Users, Globe, Calendar, User, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {API_BASE_URL, blogApi} from '@/lib/api';
import { useRef } from 'react';

interface LatestBlog {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string;
}

const Index = () => {
  const [latestBlogs, setLatestBlogs] = useState<LatestBlog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);

  useEffect(() => {
    fetchLatestBlogs();
  }, []);

  const fetchLatestBlogs = async () => {
    try {
      const blogs = await blogApi.getLatest(3);
      setLatestBlogs(blogs); // Just assign directly
    } catch (error) {
      console.error('Failed to fetch latest blogs:', error);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlayVideo = () => {
    videoRef.current?.play();
    setShowPlayButton(false);
  };

  return (
      <div className="min-h-screen">
        <Navigation />

        {/* Hero Section */}
        <HeroSlider onCtaClick={scrollToContact} />

        {/* Welcome Section */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-primary mb-6">
                  Welcome to Naledi Day and Boarding School
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  At Naledi, we believe every child has the potential to shine like a star. Our
                  commitment to academic excellence, character development, and holistic education
                  creates an environment where students thrive and reach their full potential.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  With over two decades of educational excellence, we have been nurturing young
                  minds and preparing them for a bright future. Our dedicated faculty, modern
                  facilities, and comprehensive curriculum ensure that every student receives
                  the best possible education.
                </p>
                <Link to="/about">
                  <Button variant="secondary" size="lg">
                    Learn More About Us
                  </Button>
                </Link>
              </div>

              <div className="relative">
                <div className="aspect-video rounded-lg shadow-hero overflow-hidden relative">
                  <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src="/videos/intro.mp4"
                      controls={true}
                      playsInline
                  />
                  {showPlayButton && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                        <Button
                            variant="hero"
                            size="lg"
                            className="transform hover:scale-110"
                            onClick={handlePlayVideo}
                        >
                          <Play className="mr-2 h-6 w-6" />
                          Watch Our Story
                        </Button>
                      </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Why Choose Naledi?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover what makes our school the perfect choice for your child's educational journey
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-elegant transition-shadow duration-300 border-0 shadow-card">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-hero rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Academic Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Our rigorous academic programs and experienced faculty ensure students achieve
                    outstanding results and are well-prepared for higher education and future careers.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-elegant transition-shadow duration-300 border-0 shadow-card">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-hero rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Character Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    We focus on building strong moral character, leadership skills, and social
                    responsibility to develop well-rounded individuals who contribute positively to society.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-elegant transition-shadow duration-300 border-0 shadow-card">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-hero rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Global Perspective</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Our international curriculum and diverse learning environment prepare students
                    for success in an increasingly connected and multicultural world.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Latest Blog Posts */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Latest News & Updates</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stay informed about the latest happenings at Naledi Day and Boarding School
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {latestBlogs.length > 0 ? (
                  latestBlogs.map((post) => (
                      <Card key={post._id} className="overflow-hidden hover:shadow-elegant transition-shadow duration-300 border-0 shadow-card">
                        <div className="relative h-48">
                          <img
                              src={`${API_BASE_URL}${post.image}`}
                              alt={post.title}
                              className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold text-primary mb-3">{post.title}</h3>
                          <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Link to="/blog">
                            <Button variant="outline" className="w-full group">
                              Read More
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                  ))
              ) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-muted-foreground">Loading latest news...</p>
                  </div>
              )}
            </div>

            <div className="text-center mt-8">
              <Link to="/blog">
                <Button variant="secondary" size="lg">
                  View All News
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Get In Touch With Us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ready to join the Naledi family? Contact us today to learn more about our programs and admission process
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
                      <Input placeholder="Enter your first name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
                      <Input placeholder="Enter your last name" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                    <Input type="email" placeholder="Enter your email address" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Phone Number</label>
                    <Input type="tel" placeholder="Enter your phone number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                    <Textarea
                        placeholder="Tell us how we can help you..."
                        className="min-h-[120px]"
                    />
                  </div>
                  <Button variant="secondary" className="w-full" size="lg">
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Map and Contact Info */}
              <div className="space-y-6">
                {/* Google Map Placeholder */}
                <Card className="shadow-card border-0">
                  <CardContent className="p-0">
                    <div className="h-64 rounded-lg overflow-hidden">
                      <iframe
                          title="Naledi School Location"
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15785.949891934885!2d28.393159!3d-15.469189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19408d25cc50c545%3A0xd112297847dc0e37!2sNaledi%20School!5e0!3m2!1sen!2szm!4v1691500000000!5m2!1sen!2szm"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen={false}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>

                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="shadow-card border-0">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-medium text-foreground">Address</p>
                        <p className="text-muted-foreground">Leopard Hill RD, New Kasama, Lusaka</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Phone</p>
                        <p className="text-muted-foreground">+260 979 053 520</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <p className="text-muted-foreground">naledischoolltd@gmail.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
  );
};

export default Index;