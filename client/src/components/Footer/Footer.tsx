import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { HashLink } from "react-router-hash-link";

import { useNavigate, useLocation } from "react-router-dom";
import {
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa6";

function Footer() {
  const navigate = useNavigate();
const location = useLocation();

const goToAbout = () => {
  if (location.pathname === "/") {
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }

  navigate("/");
  
  setTimeout(() => {
    document.getElementById("about")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 500);
};

const goToFeatures = () => {
  if (location.pathname === "/") {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }

  navigate("/");

  setTimeout(() => {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 500);
};

const goToReviews = () => {
  if (location.pathname === "/") {
    document.getElementById("reviews")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }

  navigate("/");

  setTimeout(() => {
    document.getElementById("reviews")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 500);
};
  return (
    <footer 
    id="contact"
    className="bg-black text-white pt-20 pb-8">

      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">

          {/* Logo */}

          <div>

            <h2 className="text-4xl font-bold">
              Restro<span className="text-orange-500">Sphere</span>
            </h2>

            <p className="mt-6 text-gray-400 leading-8">
              Experience premium dining with modern technology,
              seamless reservations and unforgettable hospitality.
            </p>

            <div className="flex gap-4 mt-8">

              

              <a
                href="https://www.instagram.com/restro_sphere.2026?igsh=MTJwc3Nnemt6Zml4"
                className="w-11 h-11 rounded-full bg-[#1E1E1E] hover:bg-orange-600 duration-300 flex items-center justify-center"
              >
                <FaInstagram />
              </a>

              

              <a
                href="https://www.linkedin.com/in/restro-sphere-b78a18427/"
                className="w-11 h-11 rounded-full bg-[#1E1E1E] hover:bg-orange-600 duration-300 flex items-center justify-center"
              >
                <FaLinkedinIn />
              </a>

            </div>

          </div>

   {/* Quick Links */}

<div>
  <h3 className="text-2xl font-semibold mb-6">
    Quick Links
  </h3>

  <ul className="space-y-4 text-gray-400">

   <li>
  <HashLink
    smooth
    to="/#home"
    className="hover:text-orange-500 duration-300"
  >
    Home
  </HashLink>
</li>

    <li>
  <a
    href="/menu"
    className="hover:text-orange-500 duration-300"
  >
    Menu
  </a>
</li>

    <li>
  <button
    type="button"
    onClick={goToAbout}
    className="cursor-pointer hover:text-orange-500 duration-300"
  >
    About
  </button>
</li>

    <li>
  <button
    type="button"
    onClick={goToFeatures}
    className="cursor-pointer hover:text-orange-500 duration-300"
  >
    Features
  </button>
</li>

    <li>
  <button
    type="button"
    onClick={goToReviews}
    className="cursor-pointer hover:text-orange-500 duration-300"
  >
    Reviews
  </button>
</li>

    

  </ul>
</div>

          {/* Contact */}

          <div>

            <h3 className="text-2xl font-semibold mb-6">
              Contact Us
            </h3>

            <div className="space-y-5 text-gray-400">

              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-orange-500 mt-1" />
                <p> New Delhi, India</p>
              </div>

  {/* Phone */}
  <a
    href="tel:+919910174623"
    className="flex items-center gap-4 text-gray-400 hover:text-orange-500 transition-colors"
  >
    <Phone size={24} className="text-orange-500" />
    <span>+91 9910174623</span>
  </a>

  {/* Email */}
  <a
    href="mailto:restrosphere2026@gmail.com"
    className="flex items-center gap-4 text-gray-400 hover:text-orange-500 transition-colors"
  >
    <Mail size={24} className="text-orange-500" />
    <span>restrosphere2026@gmail.com</span>
  </a>

</div>

          </div>

         {/* Why RestroSphere */}

<div>

  <h3 className="text-2xl font-semibold mb-6">
    Why RestroSphere ?
  </h3>

  <ul className="space-y-4 text-gray-400">

    <li className="flex items-center gap-3">
      <span className="text-orange-500">✓</span>
      Smart Management
    </li>

    <li className="flex items-center gap-3">
      <span className="text-orange-500">✓</span>
      Faster Operations
    </li>

    <li className="flex items-center gap-3">
      <span className="text-orange-500">✓</span>
      Real-Time Insights
    </li>

    <li className="flex items-center gap-3">
      <span className="text-orange-500">✓</span>
      Better Customer Experience
    </li>

    <li className="flex items-center gap-3">
      <span className="text-orange-500">✓</span>
      Secure & Reliable
    </li>

    <li className="flex items-center gap-3">
      <span className="text-orange-500">✓</span>
      Business Analytics
    </li>

  </ul>

</div>

        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">

          <p className="text-gray-500 text-sm">
            © 2026 RestroSphere. All Rights Reserved.
          </p>

          <div className="flex gap-8 mt-4 md:mt-0">

            <a
              href="#"
              className="text-gray-500 hover:text-orange-500 duration-300"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="text-gray-500 hover:text-orange-500 duration-300"
            >
              Terms & Conditions
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;