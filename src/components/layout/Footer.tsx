"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              {/* <div className="bg-blue-600 text-white px-2 py-1 rounded-lg font-bold">
                
              </div> */}
              <span className="text-xl font-bold text-white">
                <span className="text-blue-500">Matchify</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed">
              Discover trusted service providers powered by smart AI matching.
              Compare, choose, and book with confidence.
            </p>

            <div className="flex space-x-4 mt-4 text-lg">
              <FontAwesomeIcon icon={faFacebook} className="hover:text-white cursor-pointer" />
              <FontAwesomeIcon icon={faTwitter} className="hover:text-white cursor-pointer" />
              <FontAwesomeIcon icon={faInstagram} className="hover:text-white cursor-pointer" />
              <FontAwesomeIcon icon={faLinkedin} className="hover:text-white cursor-pointer" />
            </div>
          </div>

          {/*Explore */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/user/services" className="hover:text-white">Browse Services</Link></li>
              <li><Link href="/user/ai-assistant" className="hover:text-white">AI Assistant</Link></li>
              <li><Link href="/user/dashboard" className="hover:text-white">My Dashboard</Link></li>
              
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>Beirut, Lebanon</span>
              </div>

              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faPhone} />
                <span>+961 70 123 456</span>
              </div>

              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>support@matchify.com</span>
              </div>
            </div>

            <div className="mt-4 text-sm">
              <p className="text-white font-medium">Support Hours</p>
              <p>Mon - Fri: 9:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>

        {/*Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
          <p>
            © {new Date().getFullYear()} techtalks. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}