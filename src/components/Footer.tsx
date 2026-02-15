import { forwardRef } from 'react';
import { Twitter, Linkedin, Facebook } from 'lucide-react';
import pfLogo from '@/assets/pf-logo-2.png';

const quickLinks = [
  { name: 'About us', href: '#' },
  { name: 'Work', href: '#work' },
  { name: 'Services', href: '#services' },
  { name: 'How it work', href: '#process' },
  { name: 'Error 404', href: '#' },
];

const contactInfo = {
  email: 'hello@sam-visuals.com',
  location: 'Karachi, Pakistan',
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Linkedin', icon: Linkedin, href: '#' },
  { name: 'Facebook', icon: Facebook, href: '#' },
];

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo - Centered and Increased Size */}
          <div className="flex justify-center md:justify-start lg:justify-start">
            <img 
              src={pfLogo} 
              alt="SAM-VISUALS" 
              className="h-36 md:h-40 lg:h-44 w-auto mb-6 brightness-0 invert" 
            />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-background/70 hover:text-background transition-colors text-sm"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <span className="text-background/70 text-sm">
                  {contactInfo.location}
                </span>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Follow us</h4>
            <ul className="space-y-3">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    className="inline-flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm"
                  >
                    <social.icon className="w-4 h-4" />
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Brand Name */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-6 py-12">
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold text-background/10 text-center tracking-tighter">
            SAM-VISUALS
          </h2>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';