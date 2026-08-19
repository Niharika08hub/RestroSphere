import { Star } from "lucide-react";

function Testimonials() {
 
    const reviews = [
  {
    name: "Aarav Mehta",
    role: "Restaurant Owner",
      rating: 5,

    review:
      "RestroSphere helped us digitize our restaurant within days. Reservations, billing, and order management are now completely seamless.",
  },
  {
    name: "Priya Kapoor",
    role: "Restaurant Manager",
      rating: 5,

    review:
      "Managing orders between waiters and the kitchen has never been easier. Our team saves hours every day.",
  },
  {
    name: "Rohan Verma",
    role: "Operations Manager",
      rating: 4,

    review:
      "The live kitchen updates and order tracking reduced waiting time significantly. Our staff coordination has improved a lot.",
      
  },
];

  return (
    <section
  id="reviews"
  className="py-10 bg-white"
>

      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="text-center mb-16">

          <p className="uppercase tracking-[6px] text-orange-600 font-semibold">
            TESTIMONIALS
          </p>

          <h2 className="text-5xl font-bold mt-5">
What Restaurant Owners Say
          </h2>

<p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500 leading-9">            
  Discover how restaurants are improving efficiency, service quality, and business growth with RestroSphere.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {reviews.map((item) => (

            <div
              key={item.name}
              className="bg-[#FCF8F3] rounded-3xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition duration-300"
            >

              <div className="flex gap-1">
  {[...Array(5)].map((_, i) => (
    <Star
      key={i}
      size={18}
      className={
        i < item.rating
          ? "text-orange-500 fill-orange-500"
          : "text-gray-300"
      }
    />
  ))}
</div>
              <p className="text-gray-600 mt-6 leading-8 italic">
                "{item.review}"
              </p>

              <div className="mt-8 border-t pt-5">

                <h3 className="font-bold text-xl">
                  {item.name}
                </h3>

                <p className="text-gray-500">
                  {item.role}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default Testimonials;