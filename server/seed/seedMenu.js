const mongoose = require("mongoose");
require("dotenv").config();

const Menu = require("../models/Menu");
const Restaurant = require("../models/Restaurant");

const seedMenu = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const restaurant = await Restaurant.findOne({
      isActive: true,
    }).sort({ createdAt: 1 });

    if (!restaurant) {
      console.log("❌ No active restaurant found.");
      process.exit(1);
    }

    console.log("Restaurant found:", restaurant.name);
    console.log("Restaurant ID:", restaurant._id);

    const menuItems = [
      // =========================
      // ALL / FEATURED
      // =========================
      {
        name: "Overloaded Pizza",
        description:
          "Classic Italian pizza with mozzarella cheese.",
        price: 349,
        category: "All",
        image: "pizza.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Veg Supreme Burger",
        description: "fresh veggies and cheese.",
        price: 229,
        category: "Burgers",
        image: "burger.jpg",
        rating: 4.7,
        veg: true,
        isAvailable: true,
      },
      {
        name: "White Sauce Pasta",
        description:
          "Creamy pasta with herbs & parmesan.",
        price: 299,
        category: "Pasta",
        image: "pasta.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Chocolate Lava Cake",
        description:
          "Warm chocolate cake with molten center.",
        price: 189,
        category: "Desserts",
        image: "dessert.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Dal Makhani",
        description:
          "Slow cooked black lentils.",
        price: 269,
        category: "Main Course",
        image: "dalmakhani.jpg",
        rating: 4.7,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Oreo Shake",
        description:
          "Creamy Oreo milkshake.",
        price: 179,
        category: "Drinks",
        image: "oreo.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },

      // =========================
      // PIZZA
      // =========================
      {
        name: "Margherita Pizza",
        description:
          "Fresh mozzarella & basil.",
        price: 299,
        category: "Pizza",
        image: "margherita.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Farmhouse Pizza",
        description:
          "Loaded with fresh veggies.",
        price: 349,
        category: "Pizza",
        image: "farmhouse.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Cheese Burst Pizza",
        description:
          "Extra cheesy delight.",
        price: 399,
        category: "Pizza",
        image: "cheeseburst.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Veggie Delight Pizza",
        description:
          "Loaded with colorful veggies.",
        price: 329,
        category: "Pizza",
        image: "veggiedelight.jpg",
        rating: 4.7,
        veg: true,
        isAvailable: true,
      },

      // =========================
      // BURGERS
      // =========================
      {
        name: "Cheese Burger",
        description: "Cheesy & delicious.",
        price: 249,
        category: "Burgers",
        image: "cheeseburger.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Double Patty Burger",
        description:
          "Double layer of goodness.",
        price: 299,
        category: "Burgers",
        image: "doublepatty.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Crispy Burger",
        description: "Crunchy & tasty.",
        price: 259,
        category: "Burgers",
        image: "crispyburger.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },

      // =========================
      // PASTA
      // =========================
      {
        name: "Red Sauce Pasta",
        description:
          "Classic Italian tomato sauce with basil and parmesan.",
        price: 279,
        category: "Pasta",
        image: "redsaucepasta.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Alfredo Pasta",
        description:
          "Rich creamy pasta topped with mushrooms.",
        price: 329,
        category: "Pasta",
        image: "pastaAlfredo.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Pesto Pasta",
        description:
          "parmesan cheese & roasted vegetables.",
        price: 319,
        category: "Pasta",
        image: "pesto.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },

      // =========================
      // STARTERS
      // =========================
      {
        name: "Paneer Tikka",
        description:
          "Grilled paneer with Indian spices.",
        price: 249,
        category: "Starters",
        image: "paneertikka.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Veg Spring Rolls",
        description:
          "Stuffed with vegetables.",
        price: 199,
        category: "Starters",
        image: "springroll.jpg",
        rating: 4.7,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Garlic Bread",
        description:
          "Freshly baked garlic bread.",
        price: 149,
        category: "Starters",
        image: "garlicbread.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Crispy Corn",
        description:
          "Golden fried crunchy corn.",
        price: 179,
        category: "Starters",
        image: "crispycorn.jpg",
        rating: 4.7,
        veg: true,
        isAvailable: true,
      },

      // =========================
      // MAIN COURSE
      // =========================
      {
        name: "Paneer Butter Masala",
        description:
          "Rich creamy tomato gravy.",
        price: 329,
        category: "Main Course",
        image: "paneerbuttermasala.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Veg Biryani",
        description:
          "Fragrant rice with vegetables.",
        price: 299,
        category: "Main Course",
        image: "vegbiryani.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Malai Chaap",
        description:
          "Creamy soya chaap",
        price: 329,
        category: "Main Course",
        image: "malaichaap.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },

      // =========================
      // DESSERTS
      // =========================
      {
        name: "Chocolate Brownie",
        description:
          "Rich chocolate brownie.",
        price: 179,
        category: "Desserts",
        image: "brownie.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Cheesecake",
        description:
          "Creamy baked cheesecake.",
        price: 249,
        category: "Desserts",
        image: "cheesecake.jpg",
        rating: 4.9,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Ice Cream Sundae",
        description:
          "Vanilla ice cream with chocolate syrup.",
        price: 159,
        category: "Desserts",
        image: "icecream.jpg",
        rating: 4.7,
        veg: true,
        isAvailable: true,
      },

      // =========================
      // DRINKS
      // =========================
      {
        name: "Cold Coffee",
        description:
          "Chilled coffee with ice cream.",
        price: 149,
        category: "Drinks",
        image: "coldcoffee.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Virgin Mojito",
        description:
          "Refreshing mint & lime drink.",
        price: 129,
        category: "Drinks",
        image: "mojito.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
      {
        name: "Watermelon Juice",
        description:
          "Fresh watermelon juice",
        price: 139,
        category: "Drinks",
        image: "watermelon.jpg",
        rating: 4.8,
        veg: true,
        isAvailable: true,
      },
    ];

    let added = 0;
    let updated = 0;

    for (const item of menuItems) {
      const existing = await Menu.findOne({
        restaurantId: restaurant._id,
        name: item.name,
      });

      if (existing) {
        await Menu.findByIdAndUpdate(
          existing._id,
          {
            ...item,
            restaurantId: restaurant._id,
          },
          {
            new: true,
            runValidators: true,
          }
        );

        updated++;
      } else {
        await Menu.create({
          ...item,
          restaurantId: restaurant._id,
        });

        added++;
      }
    }

    console.log("=================================");
    console.log("✅ MENU SEED COMPLETED");
    console.log("=================================");
    console.log(`Total menu items: ${menuItems.length}`);
    console.log(`Added: ${added}`);
    console.log(`Updated: ${updated}`);
    console.log("Restaurant:", restaurant.name);
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ SEED MENU ERROR:", error);
    process.exit(1);
  }
};

seedMenu();