import aboutImage from "../../assets/images/about.jpg";
import { useNavigate } from "react-router-dom";
function About() {
    const navigate = useNavigate();

  return (
<section
  id="about"
  className="relative bg-[#F8F4EE] pt-4 pb-16 overflow-hidden"
>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="grid lg:grid-cols-2 gap-27 items-center">

          {/* Left Image */}
          <img
            src={aboutImage}
            alt="About RestroSphere"
            className="w-full h-[450px] object-cover rounded-[30px] shadow-2xl"
          />

          {/* Right Content */}
          <div>

            <p className="uppercase tracking-[8px] text-orange-600 mb-6">
  ABOUT US
</p>
<h2 className="text-3xl md:text-4xl font-black leading-tight">
  The Complete Restaurant
  <br />
  Management Platform
</h2>
            <p className="text-gray-600 mt-6 leading-8 text-lg">
              Designed for modern restaurants, RestroSphere simplifies operations with intelligent automation, role-based access, real-time tracking, and data-driven insights.
            </p>

            <div className="mt-8 space-y-4 text-lg">

              <p>✔ Role-Based Dashboards</p>
              <p>✔ AI Assisted Reservation</p>
              <p>✔ Live Order & Kitchen Tracking</p>
              <p>✔ Inventory & Staff Management</p>

            </div>
<button
  onClick={() => navigate("/signup")}
  className="mt-9 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-7 py-5 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
>
  Explore Platform
</button>

          </div>

        </div>

      </div>

      

    </section>
  );
}

export default About;