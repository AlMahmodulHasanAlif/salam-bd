import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaChevronRight } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { Link } from "react-router";
import FooterContactStrip from "./FooterContactStrip";
import logo from "../assets/SalamBDLogo.png";
import footerbg from "../assets/footerbg1.jpg";
import footerline from "../assets/footerline.webp";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "Gallery", href: "/gallery" },
  { label: "Video", href: "https://www.youtube.com/quraneralotv", external: true },
  { label: "Blog", href: "/blog" },
];

const policyLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "FAQ", href: "/faq" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const socialLinks = [
  {
    icon: <FaFacebookF />,
    href: "https://www.facebook.com/salambd1",
    label: "Facebook",
    color: "hover:bg-blue-600",
  },
  {
    icon: <FaInstagram />,
    href: "https://www.instagram.com/salambd",
    label: "Instagram",
    color: "hover:bg-pink-600",
  },
  {
    icon: <FaYoutube />,
    href: "https://youtube.com/@salambd1",
    label: "YouTube",
    color: "hover:bg-red-600",
  },
  {
    icon: <FaWhatsapp />,
    href: "https://wa.me/8801886699883",
    label: "WhatsApp",
    color: "hover:bg-green-500",
  },
];

// Link bullet icon — chevron marker before footer links
function IslamicBullet({ active }) {
  return (
    <FaChevronRight
      className={`w-2.5 h-2.5 shrink-0 transition-all duration-200 group-hover:translate-x-0.5 ${
        active ? "text-[#c9a84c]" : "text-[#c9a84c]/50"
      }`}
    />
  );
}

export default function Footer() {
  return (
    <footer
      className="text-gray-300 relative"
      style={{
        backgroundImage: `url(${footerbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay to keep text readable */}
      <div className="absolute inset-0 bg-[#0f2d1a]/80 pointer-events-none" />

      {/* All content sits above the overlay */}
      <div className="relative z-10">
        {/* Top accent line */}
        <div className="w-full bg-gradient-to-r from-[#1a6b3a] via-[#c9a84c] to-[#1a6b3a]" />

        <FooterContactStrip />

        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div className="space-y-4">
            {/* Logo */}
            <img
              src={logo}
              alt="Salam BD"
              className="h-12 cursor-pointer"
            />

            {/* Brand Info */}
            <p className="text-[1rem] leading-relaxed text-gray-400">
              Your trusted destination for quality Islamic products. Explore our
              full collection and bring barakah to every home.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`w-10 h-10 md:w-9 md:h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-xl md:text-sm transition-colors duration-200 ${s.color}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-2xl mb-4 border-b border-[#c9a84c]/30 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) =>
                link.external ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[1rem] text-gray-400 hover:text-[#c9a84c] transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <IslamicBullet />
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[1rem] text-gray-400 hover:text-[#c9a84c] transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <IslamicBullet />
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-white font-semibold text-2xl mb-4 border-b border-[#c9a84c]/30 pb-2">
              Important Links
            </h3>
            <ul className="space-y-2">
              {policyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[1rem] text-gray-400 hover:text-[#c9a84c] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <IslamicBullet />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-2xl font-semibold mb-4 border-b border-[#c9a84c]/30 pb-2">
              Contact Us
            </h3>
            <ul className="space-y-2 text-[1rem]">
              <li className="flex items-start gap-3 text-gray-400">
                <MdLocationOn className="text-[#c9a84c] text-lg mt-0.5 shrink-0" />
                <span>37 Ma Amena Plaza, (6th floor of Sundarban Courier),<br />falpatti area, Mirpur-10, Dhaka-1216</span>
              </li>
              <li>
                <a
                  href="tel:+8801886699883"
                  className="flex items-center gap-3 md:text-sm text-gray-400 hover:text-[#c9a84c] transition-colors duration-200"
                >
                  <MdPhone className="text-[#c9a84c] text-lg shrink-0" />
                  01886699883
                </a>
              </li>
              <li>
                <a
                  href="mailto:salambd.contact@gmail.com"
                  className="flex items-center gap-3 md:text-sm text-gray-400 hover:text-[#c9a84c] transition-colors duration-200"
                >
                  <MdEmail className="text-[#c9a84c] text-lg shrink-0" />
                  salambd.contact@gmail.com
                </a>
              </li>
              <li className="md:text-sm text-gray-400">
                <span className="text-white font-medium">Hours:</span> Sat–Thu, 9AM – 9PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-white/10 w-full">
          <img
            src={footerline}
            alt=""
            aria-hidden="true"
            className="w-full block"
          />
          <p className="absolute inset-0 flex items-center justify-center text-xs text-white">
            © {new Date().getFullYear()} Salam BD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}