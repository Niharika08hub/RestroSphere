import heroImage from "../../assets/images/hero.jpg";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[700px] sm:min-h-screen overflow-hidden">

      {/* Background Image */}
      <img
        src={heroImage}
        alt="RestroSphere"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>

      {/* Hero Content */}
<div className="relative z-10 flex items-center min-h-[700px] sm:min-h-screen -translate-y-10 sm:-translate-y-12 lg:-translate-y-14">        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">

          <div className="max-w-3xl text-white">

            <p className="uppercase tracking-[4px] sm:tracking-[6px] text-orange-500 font-semibold mb-7 text-sm sm:text-base">
              SMART RESTAURANT MANAGEMENT
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-extrabold leading-[1.05]">
              Manage Your Restaurant
              <br />
              Smarter Than Ever
            </h1>

            <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-gray-200 leading-7 sm:leading-8 max-w-2xl">
              Streamline reservations, orders, staff, inventory, and business analytics with one intelligent platform designed for modern restaurants.
            </p>

            <div className="mt-15 sm:mt-16 flex flex-col sm:flex-row gap-6 sm:gap-6">

              <button
                onClick={() => navigate("/menu")}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-orange-600 text-white font-semibold text-lg sm:text-xl hover:bg-orange-700 transition"
              >
                Explore Menu
              </button>

              <button
                onClick={() => navigate("/subscription")}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl border-2 border-white text-white font-semibold text-lg sm:text-xl hover:bg-white hover:text-orange-600 transition"
              >
                Buy a Subscription
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* SAME CURVED BOTTOM */}
 <div
  className="
    absolute
    -bottom-[1px]
    left-1/2
    -translate-x-1/2
    z-20
    w-[120%]
    sm:w-[114%]
    lg:w-[107%]
    h-[90px]
    sm:h-[105px]
    lg:h-[120px]
    bg-[#f8f5f0]
    rounded-[50%_50%_0_0/95%_95%_0_0]
  "
></div>

    </section>
  );
}

export default Hero;