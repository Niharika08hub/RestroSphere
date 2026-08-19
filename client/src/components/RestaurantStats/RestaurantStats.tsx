import {
  FaStore,
  FaShoppingBag,
  FaMapMarkedAlt,
  FaStar,
} from "react-icons/fa";

function RestaurantStats() {
  const stats = [
    {
      icon: <FaStore  size={26} />,
      number: "25K+",
      title: "Restaurants Onboarded",
    },
    {
      icon: <FaShoppingBag size={26} />,
      number: "150K+",
      title: "Orders Served",
    },
    {
      icon: <FaMapMarkedAlt size={26} />,
      number: "15+",
      title: "Cities Served",
    },
    {
      icon: <FaStar size={26} />,
      number: "4.9",
      title: "Average Rating",
    },
  ];

  return (
    <section 
    className="py-9 bg-[#FCF8F3]" 
     >
        
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center mb-12">

          <p className="uppercase tracking-[6px] text-orange-600 font-semibold">
            OUR ACHIEVEMENTS
          </p>

          <h2 className="text-5xl font-bold mt-5">
            Trusted By Thousands
          </h2>

          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-8">
Empowering restaurants with smart technology to manage operations, improve customer experiences, and grow their business with confidence.          </p>

        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {stats.map((item) => (

            <div
              key={item.title}
              className="bg-white rounded-3xl p-10 text-center shadow-lg hover:shadow-2xl transition duration-300"
            >

              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto text-orange-600">
                {item.icon}
              </div>

              <h3 className="text-4xl font-bold mt-4 text-orange-600">
                {item.number}
              </h3>

              <p className="mt-2 text-gray-600 text-lg">
                {item.title}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default RestaurantStats;