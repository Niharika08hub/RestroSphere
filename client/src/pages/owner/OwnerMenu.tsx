import React, { useEffect, useRef, useState } from "react";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/menuService";

type MenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
};

const OwnerMenu: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  // =========================
  // LOAD MENU
  // =========================

  const loadMenu = async () => {
    try {
      setLoading(true);

      const data = await getMenu();

      setItems(data);
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to load menu"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
    });

    setEditingItem(null);
    setShowForm(false);
  };

  // =========================
  // ADD / EDIT
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category) {
      alert("Name, price and category are required");
      return;
    }

    try {
      if (editingItem) {
        await updateMenuItem(editingItem._id, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          image: form.image,
        });
      } else {
        await addMenuItem({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          image: form.image,
        });
      }

      resetForm();

      await loadMenu();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save menu item"
      );
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);

    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      category: item.category,
      image: item.image || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // AVAILABILITY
  // =========================

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item._id, {
        isAvailable: !item.isAvailable,
      });

      await loadMenu();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update availability"
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmed) return;

    try {
      await deleteMenuItem(id);

      await loadMenu();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete item"
      );
    }
  };

  // ============================
// SLIDER
// ============================

const scrollLeft = () => {
  const slider = sliderRef.current;
  if (!slider) return;

  const card = slider.firstElementChild as HTMLElement;
  if (!card) return;

  const gap = parseInt(getComputedStyle(slider).gap) || 0;
  const move = (card.offsetWidth + gap) * 4;

  slider.scrollBy({
    left: -move,
    behavior: "smooth",
  });
};

const scrollRight = () => {
  const slider = sliderRef.current;
  if (!slider) return;

  const card = slider.firstElementChild as HTMLElement;
  if (!card) return;

  const gap = parseInt(getComputedStyle(slider).gap) || 0;
  const move = (card.offsetWidth + gap) * 4;

  const maxScroll = slider.scrollWidth - slider.clientWidth;
  const nextPosition = Math.min(
    slider.scrollLeft + move,
    maxScroll
  );

  slider.scrollTo({
    left: nextPosition,
    behavior: "smooth",
  });
};

  // =========================
  // UI
  // =========================

  return (
<div className="w-full min-h-screen bg-[#f8f9fb] px-0 py-8">
      {/* ================= HEADER ================= */}

      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
<div className="w-full text-center">
  <p className="text-xs sm:text-sm font-semibold tracking-[3px] text-[#ff6500]">
    RESTAURANT MANAGEMENT
  </p>

  <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#09234a]">
    Menu Management
  </h1>

  <p className="mt-3 mx-auto max-w-2xl text-sm sm:text-base text-slate-500">
    Manage your restaurant menu, pricing and item availability.
  </p>
</div>
        <button
          onClick={() => {
            if (showForm && !editingItem) {
              setShowForm(false);
            } else {
              setEditingItem(null);

              setForm({
                name: "",
                description: "",
                price: "",
                category: "",
                image: "",
              });

              setShowForm(true);
            }
          }}
className="
  w-full
  shrink-0
  rounded-xl
  bg-[#ff6500]
  px-6 py-4
  text-base
  font-semibold
  text-white
  shadow-sm
  transition
  hover:bg-[#ed5d00]
  sm:px-9
  lg:w-[180px]
"        >
          {editingItem ? "Edit Item" : "+ Add Item"}
        </button>
      </div>

      {/* ================= ADD / EDIT FORM ================= */}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-[#09234a]">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h2>

            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-slate-500 hover:text-[#ff6500]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <input
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff6500]"
              placeholder="Item name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />

            <input
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff6500]"
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff6500]"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value,
                })
              }
            />

            <input
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff6500] sm:col-span-2 lg:col-span-1"
              placeholder="Image URL"
              value={form.image}
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.value,
                })
              }
            />

            <textarea
              className="min-h-[48px] rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#ff6500] sm:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </div>

          <button
            type="submit"
            className="mt-5 rounded-xl bg-[#ff6500] px-7 py-3 font-semibold text-white"
          >
            {editingItem ? "Update Item" : "Save Item"}
          </button>
        </form>
      )}

      {/* ================= MENU ================= */}

      {loading ? (
        <div className="rounded-2xl bg-white py-24 text-center text-slate-500">
          Loading menu...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center">
          <h2 className="text-xl font-bold text-[#09234a]">
            No menu items yet
          </h2>

          <p className="mt-2 text-slate-400">
            Add your first menu item to get started.
          </p>
        </div>
      ) : (
        <section>

          {/* SECTION HEADER */}

          <div className="mb-5 flex items-center justify-between gap-4">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#09234a]">
                Restaurant Menu
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {items.length} menu items
              </p>
            </div>

            {/* ARROWS */}

            <div className="flex gap-3">

              <button
                type="button"
                onClick={scrollLeft}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-[#09234a] shadow-sm transition hover:border-[#ff6500] hover:text-[#ff6500]"
                aria-label="Previous menu items"
              >
                ←
              </button>

              <button
                type="button"
                onClick={scrollRight}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-[#09234a] shadow-sm transition hover:border-[#ff6500] hover:text-[#ff6500]"
                aria-label="Next menu items"
              >
                →
              </button>

            </div>
          </div>

          {/* ================= HORIZONTAL CARDS ================= */}

         <div
  ref={sliderRef}
  className="flex w-full flex-nowrap gap-4 overflow-hidden pb-5 lg:gap-6"
  style={{
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  }}

  >
          {items.map((item) => (
  <article
    key={item._id}
className="
  group
  flex-[0_0_100%]
  shrink-0
  overflow-hidden
  rounded-2xl
  bg-white
  sm:flex-[0_0_calc((100%_-_16px)/2)]
  lg:flex-[0_0_calc((100%_-_72px)/4)]
">
                {/* IMAGE */}

<div className="relative h-[180px] w-full overflow-hidden bg-slate-100 sm:h-[225px] lg:h-[240px]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No image
                    </div>
                  )}

                  {/* CATEGORY */}

                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#09234a] shadow-sm">
                    {item.category}
                  </span>

                </div>

                {/* CONTENT */}

                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <h3 className="text-xl font-semibold text-[#09234a]">
                      {item.name}
                    </h3>

                    <span className="shrink-0 text-lg font-bold text-[#ff6500]">
                      ₹{item.price}
                    </span>

                  </div>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {item.description || "No description available."}
                  </p>

                  {/* AVAILABILITY */}

                  <button
                    type="button"
                    onClick={() => toggleAvailability(item)}
                    className={`mt-4 w-full rounded-xl border px-4 py-3 font-semibold transition ${
                      item.isAvailable
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    {item.isAvailable
                      ? "✓ Available"
                      : "✕ Unavailable"}
                  </button>

                  {/* EDIT / DELETE */}

                  <div className="mt-3 grid grid-cols-2 gap-3">

                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-[#09234a] transition hover:border-[#ff6500] hover:text-[#ff6500]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              </article>
            ))}

          </div>

        </section>
      )}

    </div>
  );
};

export default OwnerMenu;