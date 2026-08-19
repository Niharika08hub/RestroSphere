function MenuHero() {
  return (
    
    <section className="bg-[#FCF8F3] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <p className="uppercase tracking-[6px] text-orange-600 font-semibold">
          OUR MENU
        </p>

        <h1 className="text-5xl lg:text-6xl font-bold mt-5 leading-tight">
          Discover Samrt
          <span className="text-orange-600"> Digital Menu </span>
          
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-8">
         RestroSphere provides every restaurant with a beautifully designed digital menu. Owners can easily add, edit, remove, and organize dishes anytime without technical knowledge.
        </p>

        <div className="flex justify-center gap-5 mt-10">
   
<button className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-xl transition"
  onClick={() =>
    document.getElementById("menu-categories")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
>
  View Categories
</button>
        </div>

      </div>
    </section>
  );
}

export default MenuHero;