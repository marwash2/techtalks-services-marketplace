"use client";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className=" bg-gray-50 border-t border-gray-100 mt-16 border-t-2 border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              {/* <div className="bg-blue-600 text-white px-2 py-1 rounded-lg font-bold">
                
              </div> */}
              <span className="text-xl font-bold text-white">
                <span className="text-gray-900">
                  <Image
                    src="/logo-icon.png"
                    alt="Logo"
                    width={150}
                    height={80}
                  />
                </span>
              </span>
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed">
              Discover trusted service providers powered by smart AI matching.
              Compare, choose, and book with confidence.
            </p>

            <div className="flex space-x-4 mt-4 text-lg">
              <FontAwesomeIcon
                icon={faFacebook}
                className="text-blue-700 cursor-pointer"
              />

              <FontAwesomeIcon
                icon={faInstagram}
                className="text-orange-600 cursor-pointer"
              />
              <FontAwesomeIcon
                icon={faLinkedin}
                className="text-blue-700 cursor-pointer"
              />
            </div>
          </div>

          {/*Explore */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link
                  href="/user/services"
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  Browse Services
                </Link>
              </li>
              <li>
                <Link
                  href="/user/ai-assistant"
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link
                  href="/user/dashboard"
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link
                  href="/about"
                  className="hover:text-blue-600 transition cursor-pointer"
                >
                  About Us
                </Link>
                <div className="mt-4 text-sm">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Support Hours
                  </p>
                  <p>Mon - Fri: 9:00 AM - 5:00 PM</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Contact
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-blue-600"
                />
                <span>Beirut, Lebanon</span>
              </div>

              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faPhone} className="text-blue-600" />
                <span>+961 70 123 456</span>
              </div>

              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-blue-600" />
                <span>support@khidmati.com</span>
              </div>
            </div>
          </div>
        </div>

        {/*Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Techtalk Services Marketplace. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
