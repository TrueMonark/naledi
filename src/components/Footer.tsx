import { Link } from "react-router-dom";
import {
  BookOpen,
  Youtube,
  Instagram,
  Facebook,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Requirements", path: "/requirements" },
    { name: "Devotion", path: "/devotion" },
  ];

  const socialLinks = [
    {
      name: "YouTube",
      icon: Youtube,
      url: "#", // Add your YouTube URL here
      color: "hover:text-red-600",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "#", // Add your Instagram URL here
      color: "hover:text-pink-600",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://www.facebook.com/share/1EQq9LPCwS/",
      color: "hover:text-blue-600",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "https://wa.me/260979053520", // WhatsApp click-to-chat link
      color: "hover:text-green-600",
    },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="p-2">
                <img src="/favicon.ico" alt="Logo" className="h-12 w-12" />
              </div>
              <div>
                <span className="text-xl font-bold">Naledi</span>
                <span className="text-sm block leading-none opacity-90">
                  Day & Boarding School
                </span>
              </div>
            </Link>
            <p className="text-sm opacity-90 mb-4">
              Nurturing Excellence, Building Future Leaders. A premier
              educational institution committed to academic excellence and
              character development.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  className={`text-primary-foreground/80 transition-colors duration-200 ${social.color}`}
                  aria-label={social.name}>
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-sm opacity-90 hover:opacity-100 transition-opacity duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 opacity-80" />
                <div className="text-sm opacity-90">
                  <p>Leopard Hill RD</p>
                  <p>New Kasama, Lusaka</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 opacity-80" />
                <span className="text-sm opacity-90">+260 967 711 948</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 opacity-80" />
                <span className="text-sm opacity-90">
                  naledischoolltd@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* School Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">School Hours</h3>
            <div className="space-y-2 text-sm opacity-90">
              <div className="flex justify-between">
                <span>Monday - Thursday:</span>
                <span>8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Friday:</span>
                <span>8:00 AM - 1:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm opacity-80">
              © 2025 Naledi Day and Boarding School. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 items-center">
              <a
                href="#"
                className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                Terms of Service
              </a>
              <Link
                to="/admin"
                className="text-xs opacity-60 hover:opacity-80 transition-opacity ml-4">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
