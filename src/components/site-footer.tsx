import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";

const nutritionIcon = `data:image/svg+xml;base64,${btoa(`
<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="20" fill="url(#grad1)" stroke="#FFB300" stroke-width="2"/>
  <circle cx="24" cy="24" r="12" fill="url(#grad2)" stroke="#FFB300" stroke-width="1"/>
  <circle cx="24" cy="24" r="6" fill="#FFB300"/>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFB300;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFB300;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:0.8" />
    </linearGradient>
  </defs>
</svg>
`)}`;

export function SiteFooter() {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "AI Advisor", href: "/advisor" },
        { label: "My Plans", href: "/my-plans" },
        { label: "Progress Tracker", href: "/tracker" },
        { label: "Community", href: "/community" },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Science Library", href: "/science" },
        { label: "Supplement Guide", href: "/guide" },
        { label: "Training Tips", href: "/training" },
        { label: "Nutrition Blog", href: "/blog" },
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Contact Us", href: "/contact" },
        { label: "Live Chat", href: "/chat" },
        { label: "FAQs", href: "/faq" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Partnerships", href: "/partners" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-background to-muted/30 border-t border-primary/20">
      <div className="container px-4 md:px-6 py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12">
                <img
                  src={nutritionIcon}
                  alt="NutriWise AI"
                  className="w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
                  NutriWise AI
                </h3>
                <p className="text-sm text-muted-foreground">Elite Nutrition Intelligence</p>
              </div>
            </Link>
            
            <p className="text-muted-foreground leading-relaxed">
              Trusted by 50,000+ elite athletes worldwide. Get AI-powered supplement recommendations 
              that are scientifically proven to enhance your performance and accelerate your results.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@nutriwise.ai</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>1-800-NUTRIWISE</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
          
          {/* Navigation Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-lg font-bold text-foreground">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Social Links & Newsletter */}
        <div className="border-t border-border/50 pt-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <h5 className="text-lg font-bold">Follow the Elite</h5>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <p className="text-sm text-muted-foreground">
                Join 50,000+ athletes getting weekly insights
              </p>
              <div className="mt-2 flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                />
                <button className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} NutriWise AI. All rights reserved. 
              <span className="ml-2 text-primary font-medium">Elite Performance, Delivered.</span>
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
