import {
  FaCalendarAlt,
  FaClipboardList,
  FaUsers,
  FaBoxes,
  FaChartLine,
  FaUserShield,
} from "react-icons/fa";

function WhyChoose() {
  const features = [
    {
      title: "AI Reservations",
      text: "Book tables effortlessly with AI-powered recommendations.",
      icon: <FaCalendarAlt size={20} strokeWidth={2} />,
    },
    {
      title: "Live Order Tracking",
      text: "Track every order from kitchen to table in real time.",
      icon: <  FaClipboardList size={20} strokeWidth={2} />,
    },
    {
      title: "Staff Management",
      text: "Manage staff roles, schedules, and daily restaurant operations efficiently.",
      icon: <  FaUsers size={20} strokeWidth={2} />,
    },
    {
      title: "Inventory Control",
      text: "Manage stock and receive low inventory alerts instantly.",
      icon: <    FaBoxes size={20} strokeWidth={2} />,
    },
    {
      title: "Business Analytics",
      text: "Gain insights into sales, revenue, peak hours, and restaurant performance.",
      icon: <  FaChartLine size={20} strokeWidth={2} />,
    },
    {
      title: "Role-Based Access",
      text: "Secure dashboards for Owners, Managers, Kitchen Staff, Waiters, and Customers.",
      icon: <  FaUserShield size={20} strokeWidth={2} />,
    },
  ];

  return (
    <section
      id="features"
      className="py-12 bg-[#FCF8F3]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        <div className="text-center">

          <p className="uppercase tracking-[6px] text-orange-600 font-semibold">
            WHY RESTROSPHERE
          </p>

          <h2 className="text-5xl font-bold mt-5 leading-tight">
            Everything You Need
            <br />
            To Run A Modern Restaurant
          </h2>

          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-8">
One intelligent platform to manage every aspect of your restaurant.          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">

          {features.map((item) => (

            <div
              key={item.title}
className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >

<div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">                {item.icon}
              </div>

              <h3 className="text-2xl font-bold mt-5">
                {item.title}
              </h3>

              <p className="text-gray-600 mt-5 leading-8 text-lg">
                {item.text}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default WhyChoose;