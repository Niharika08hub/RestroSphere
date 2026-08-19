import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  CircleX,
} from "lucide-react";

import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  type InventoryItem,
} from "../../services/inventoryService";

const categories = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Meat",
  "Grains",
  "Spices",
  "Beverages",
  "Packaging",
  "Other",
];

const units = [
  "kg",
  "g",
  "litre",
  "ml",
  "piece",
  "packet",
  "box",
  "dozen",
];

function OwnerInventory() {
  const [items, setItems] = useState<
    InventoryItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [stockFilter, setStockFilter] =
    useState("all");

  const [showModal, setShowModal] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(null);

  const [form, setForm] = useState({
    itemName: "",
    category: "Vegetables",
    quantity: "",
    unit: "kg",
    minimumStock: "5",
    supplier: "",
    price: "",
  });

  // =====================================
  // LOAD INVENTORY
  // =====================================

  const loadInventory = async () => {
    try {
      setLoading(true);

      const response =
        await getInventory();

      setItems(response.data || []);
    } catch (error: any) {
      console.error(
        "LOAD INVENTORY ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // =====================================
  // STOCK STATUS
  // =====================================

  const getStockStatus = (
    item: InventoryItem
  ) => {
    if (item.quantity <= 0) {
      return "out";
    }

    if (
      item.quantity <= item.minimumStock
    ) {
      return "low";
    }

    return "in";
  };

  // =====================================
  // COUNTS
  // =====================================

  const totalItems = items.length;

  const inStock = items.filter(
    (item) =>
      getStockStatus(item) === "in"
  ).length;

  const lowStock = items.filter(
    (item) =>
      getStockStatus(item) === "low"
  ).length;

  const outOfStock = items.filter(
    (item) =>
      getStockStatus(item) === "out"
  ).length;

  // =====================================
  // FILTER
  // =====================================

  const filteredItems = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !value ||
        item.itemName
          .toLowerCase()
          .includes(value) ||
        item.category
          .toLowerCase()
          .includes(value) ||
        item.supplier
          ?.toLowerCase()
          .includes(value);

      const matchesCategory =
        categoryFilter === "all" ||
        item.category ===
          categoryFilter;

      const status =
        getStockStatus(item);

      const matchesStock =
        stockFilter === "all" ||
        stockFilter === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    items,
    search,
    categoryFilter,
    stockFilter,
  ]);

  // =====================================
  // FORM
  // =====================================

  const resetForm = () => {
    setForm({
      itemName: "",
      category: "Vegetables",
      quantity: "",
      unit: "kg",
      minimumStock: "5",
      supplier: "",
      price: "",
    });

    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (
    item: InventoryItem
  ) => {
    setEditingItem(item);

    setForm({
      itemName: item.itemName || "",
      category:
        item.category || "Other",
      quantity: String(
        item.quantity ?? 0
      ),
      unit: item.unit || "kg",
      minimumStock: String(
        item.minimumStock ?? 5
      ),
      supplier:
        item.supplier || "",
      price: String(
        item.price ?? 0
      ),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // =====================================
  // SAVE
  // =====================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.itemName.trim()) {
      alert("Please enter item name.");
      return;
    }

    if (form.quantity === "") {
      alert("Please enter quantity.");
      return;
    }

    const quantity =
      Number(form.quantity);

    const minimumStock =
      Number(form.minimumStock);

    const price =
      Number(form.price || 0);

    if (
      Number.isNaN(quantity) ||
      quantity < 0
    ) {
      alert(
        "Please enter a valid quantity."
      );
      return;
    }

    if (
      Number.isNaN(minimumStock) ||
      minimumStock < 0
    ) {
      alert(
        "Please enter a valid minimum stock."
      );
      return;
    }

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      alert(
        "Please enter a valid price."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        itemName:
          form.itemName.trim(),
        category: form.category,
        quantity,
        unit: form.unit,
        minimumStock,
        supplier:
          form.supplier.trim(),
        price,
      };

      if (editingItem) {
        await updateInventory(
          editingItem._id,
          payload
        );
      } else {
        await createInventory(
          payload
        );
      }

      setShowModal(false);
      resetForm();

      await loadInventory();
    } catch (error: any) {
      console.error(
        "SAVE INVENTORY ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to save inventory item."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // DELETE
  // =====================================

  const handleDelete = async (
    item: InventoryItem
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${item.itemName} from inventory?`
      );

    if (!confirmed) return;

    try {
      await deleteInventory(
        item._id
      );

      await loadInventory();
    } catch (error: any) {
      console.error(
        "DELETE INVENTORY ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete inventory item."
      );
    }
  };

  // =====================================
  // STATUS UI
  // =====================================

  const getStatusLabel = (
    status: string
  ) => {
    if (status === "out") {
      return "Out of Stock";
    }

    if (status === "low") {
      return "Low Stock";
    }

    return "In Stock";
  };

  const getStatusClass = (
    status: string
  ) => {
    if (status === "out") {
      return "bg-red-50 text-red-600";
    }

    if (status === "low") {
      return "bg-yellow-50 text-yellow-600";
    }

    return "bg-green-50 text-green-600";
  };

  return (
    <div className="
      w-full
      min-h-screen
      bg-[#f7f7f8]
      -mt-8
    ">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="
        w-full
        px-4 sm:px-6 lg:px-8
        pt-0
      ">

        <div className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-5
        ">

          <div>

            <p className="
              text-xs
              uppercase
              tracking-[0.16em]
              text-orange-500
              font-semibold
            ">
              Restaurant Management
            </p>

            <h1 className="
              mt-1
              text-2xl
              sm:text-3xl
              font-bold
              text-[#172033]
            ">
              Inventory
            </h1>

            <p className="
              mt-1
              text-sm
              sm:text-base
              text-gray-500
            ">
              Track ingredients, stock levels
              and inventory details.
            </p>

          </div>

          <div className="
            flex
            flex-col
            sm:flex-row
            gap-3
          ">

            <button
              type="button"
              onClick={loadInventory}
              disabled={loading}
              className="
                w-full
                sm:w-auto
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-700
                text-sm
                font-semibold
                hover:border-orange-300
                hover:text-orange-600
                disabled:opacity-60
                transition
              "
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={
                openAddModal
              }
              className="
                w-full
                sm:w-auto
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                bg-orange-500
                text-white
                text-sm
                font-semibold
                hover:bg-orange-600
                transition
              "
            >
              <Plus size={18} />

              Add Inventory Item
            </button>

          </div>

        </div>

      </div>

      {/* =====================================
          STATS
      ===================================== */}

      <div className="
        px-4 sm:px-6 lg:px-8
        mt-6
      ">

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-4
        ">

          {/* TOTAL */}

          <div className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            p-5
            shadow-sm
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-gray-500
                ">
                  Total Items
                </p>

                <h2 className="
                  mt-1
                  text-2xl
                  font-bold
                  text-[#172033]
                ">
                  {totalItems}
                </h2>

              </div>

              <div className="
                w-11
                h-11
                rounded-xl
                bg-orange-50
                text-orange-500
                flex
                items-center
                justify-center
              ">
                <Package size={21} />
              </div>

            </div>

          </div>

          {/* IN STOCK */}

          <div className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            p-5
            shadow-sm
          ">

            <p className="
              text-sm
              text-gray-500
            ">
              In Stock
            </p>

            <h2 className="
              mt-1
              text-2xl
              font-bold
              text-green-600
            ">
              {inStock}
            </h2>

            <p className="
              mt-2
              text-xs
              text-gray-400
            ">
              Healthy stock levels
            </p>

          </div>

          {/* LOW STOCK */}

          <div className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            p-5
            shadow-sm
          ">

            <p className="
              text-sm
              text-gray-500
            ">
              Low Stock
            </p>

            <h2 className="
              mt-1
              text-2xl
              font-bold
              text-yellow-600
            ">
              {lowStock}
            </h2>

            <p className="
              mt-2
              text-xs
              text-gray-400
            ">
              Needs attention
            </p>

          </div>

          {/* OUT OF STOCK */}

          <div className="
            bg-white
            border
            border-gray-200
            rounded-2xl
            p-5
            shadow-sm
          ">

            <p className="
              text-sm
              text-gray-500
            ">
              Out of Stock
            </p>

            <h2 className="
              mt-1
              text-2xl
              font-bold
              text-red-600
            ">
              {outOfStock}
            </h2>

            <p className="
              mt-2
              text-xs
              text-gray-400
            ">
              Immediate restocking needed
            </p>

          </div>

        </div>

      </div>

      {/* =====================================
          INVENTORY LIST
      ===================================== */}

      <div className="
        px-4 sm:px-6 lg:px-8
        py-6 sm:py-8
      ">

        <div className="
          bg-white
          border
          border-gray-200
          rounded-2xl
          shadow-sm
          overflow-hidden
        ">

          {/* LIST HEADER */}

          <div className="
            p-4 sm:p-6
            border-b
            border-gray-100
          ">

            <div className="
              flex
              flex-col
              xl:flex-row
              xl:items-center
              xl:justify-between
              gap-4
            ">

              <div>

                <h2 className="
                  text-lg
                  sm:text-xl
                  font-bold
                ">
                  Inventory Items
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  Manage your restaurant stock.
                </p>

              </div>

              <div className="
                flex
                flex-col
                sm:flex-row
                gap-3
              ">

                {/* SEARCH */}

                <div className="
                  relative
                  w-full
                  sm:w-72
                ">

                  <Search
                    size={18}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search inventory..."
                    className="
                      w-full
                      h-11
                      pl-10
                      pr-4
                      rounded-xl
                      border
                      border-gray-200
                      bg-gray-50
                      text-sm
                      outline-none
                      focus:border-orange-400
                      focus:ring-2
                      focus:ring-orange-100
                    "
                  />

                </div>

                {/* CATEGORY */}

                <select
                  value={
                    categoryFilter
                  }
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value
                    )
                  }
                  className="
                    h-11
                    px-3
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    text-sm
                    outline-none
                    focus:border-orange-400
                  "
                >

                  <option value="all">
                    All Categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

                {/* STOCK */}

                <select
                  value={
                    stockFilter
                  }
                  onChange={(e) =>
                    setStockFilter(
                      e.target.value
                    )
                  }
                  className="
                    h-11
                    px-3
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    text-sm
                    outline-none
                    focus:border-orange-400
                  "
                >

                  <option value="all">
                    All Stock
                  </option>

                  <option value="in">
                    In Stock
                  </option>

                  <option value="low">
                    Low Stock
                  </option>

                  <option value="out">
                    Out of Stock
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* CONTENT */}

          <div className="p-4 sm:p-6">

            {loading ? (

              <div className="
                min-h-[300px]
                flex
                items-center
                justify-center
              ">

                <div className="text-center">

                  <RefreshCw
                    size={30}
                    className="
                      mx-auto
                      text-orange-500
                      animate-spin
                    "
                  />

                  <p className="
                    mt-3
                    text-sm
                    text-gray-500
                  ">
                    Loading inventory...
                  </p>

                </div>

              </div>

            ) : filteredItems.length === 0 ? (

              <div className="
                min-h-[300px]
                flex
                items-center
                justify-center
                text-center
                px-4
              ">

                <div>

                  <Package
                    size={44}
                    className="
                      mx-auto
                      mb-4
                      text-gray-300
                    "
                  />

                  <h3 className="
                    text-lg
                    font-semibold
                    text-gray-700
                  ">
                    {search ||
                    categoryFilter !==
                      "all" ||
                    stockFilter !==
                      "all"
                      ? "No inventory items found"
                      : "No inventory items yet"}
                  </h3>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-400
                    max-w-sm
                  ">
                    {search ||
                    categoryFilter !==
                      "all" ||
                    stockFilter !==
                      "all"
                      ? "Try changing your search or filters."
                      : "Add your first inventory item to start tracking stock."}
                  </p>

                </div>

              </div>

            ) : (

              <div className="
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-4
              ">

                {filteredItems.map(
                  (item) => {

                    const status =
                      getStockStatus(
                        item
                      );

                    return (
                      <div
                        key={
                          item._id
                        }
                        className="
                          border
                          border-gray-200
                          rounded-2xl
                          p-4 sm:p-5
                          hover:border-orange-200
                          transition
                        "
                      >

                        {/* TOP */}

                        <div className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        ">

                          <div className="
                            flex
                            items-center
                            gap-3
                            min-w-0
                          ">

                            <div className="
                              w-11
                              h-11
                              shrink-0
                              rounded-xl
                              bg-orange-50
                              text-orange-500
                              flex
                              items-center
                              justify-center
                            ">
                              <Package
                                size={20}
                              />
                            </div>

                            <div className="min-w-0">

                              <div className="
                                flex
                                items-center
                                gap-2
                                flex-wrap
                              ">

                                <h3 className="
                                  font-semibold
                                  text-gray-800
                                  truncate
                                ">
                                  {item.itemName}
                                </h3>

                                <span className="
                                  px-2.5
                                  py-1
                                  rounded-full
                                  bg-gray-100
                                  text-gray-500
                                  text-xs
                                  font-medium
                                ">
                                  {item.category}
                                </span>

                              </div>

                              <p className="
                                mt-1
                                text-sm
                                text-gray-400
                              ">
                                {item.supplier
                                  || "No supplier added"}
                              </p>

                            </div>

                          </div>

                          {/* ACTIONS */}

                          <div className="
                            flex
                            items-center
                            gap-1
                          ">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  item
                                )
                              }
                              className="
                                w-9
                                h-9
                                rounded-lg
                                flex
                                items-center
                                justify-center
                                text-gray-500
                                hover:bg-orange-50
                                hover:text-orange-600
                                transition
                              "
                              title="Edit item"
                            >
                              <Pencil
                                size={16}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  item
                                )
                              }
                              className="
                                w-9
                                h-9
                                rounded-lg
                                flex
                                items-center
                                justify-center
                                text-gray-400
                                hover:bg-red-50
                                hover:text-red-500
                                transition
                              "
                              title="Delete item"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>

                          </div>

                        </div>

                        {/* STOCK INFO */}

                        <div className="
                          mt-5
                          grid
                          grid-cols-2
                          sm:grid-cols-4
                          gap-3
                        ">

                          <div className="
                            rounded-xl
                            bg-gray-50
                            p-3
                          ">

                            <p className="
                              text-xs
                              text-gray-400
                            ">
                              Quantity
                            </p>

                            <p className="
                              mt-1
                              font-bold
                              text-gray-800
                            ">
                              {item.quantity}{" "}
                              {item.unit}
                            </p>

                          </div>

                          <div className="
                            rounded-xl
                            bg-gray-50
                            p-3
                          ">

                            <p className="
                              text-xs
                              text-gray-400
                            ">
                              Minimum
                            </p>

                            <p className="
                              mt-1
                              font-bold
                              text-gray-800
                            ">
                              {
                                item.minimumStock
                              }{" "}
                              {item.unit}
                            </p>

                          </div>

                          <div className="
                            rounded-xl
                            bg-gray-50
                            p-3
                          ">

                            <p className="
                              text-xs
                              text-gray-400
                            ">
                              Unit Price
                            </p>

                            <p className="
                              mt-1
                              font-bold
                              text-gray-800
                            ">
                              ₹
                              {Number(
                                item.price ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                          </div>

                          <div className="
                            rounded-xl
                            bg-gray-50
                            p-3
                          ">

                            <p className="
                              text-xs
                              text-gray-400
                            ">
                              Status
                            </p>

                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-1
                                mt-1
                                px-2
                                py-1
                                rounded-full
                                text-xs
                                font-semibold
                                ${getStatusClass(
                                  status
                                )}
                              `}
                            >

                              {status ===
                                "in" && (
                                <CheckCircle2
                                  size={13}
                                />
                              )}

                              {status ===
                                "low" && (
                                <AlertTriangle
                                  size={13}
                                />
                              )}

                              {status ===
                                "out" && (
                                <CircleX
                                  size={13}
                                />
                              )}

                              {getStatusLabel(
                                status
                              )}

                            </span>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* =====================================
          ADD / EDIT MODAL
      ===================================== */}

      {showModal && (
        <div className="
          fixed
          inset-0
          z-50
          bg-black/40
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            w-full
            max-w-2xl
            max-h-[90vh]
            overflow-y-auto
            bg-white
            rounded-2xl
            shadow-2xl
          ">

            {/* MODAL HEADER */}

            <div className="
              p-5 sm:p-6
              border-b
              border-gray-100
              flex
              items-center
              justify-between
              gap-3
            ">

              <div>

                <h2 className="
                  text-xl
                  font-bold
                  text-gray-800
                ">
                  {editingItem
                    ? "Edit Inventory Item"
                    : "Add Inventory Item"}
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  {editingItem
                    ? "Update inventory and stock details."
                    : "Add a new ingredient or stock item."}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={saving}
                className="
                  w-9
                  h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  hover:bg-gray-100
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="
                p-5 sm:p-6
                space-y-4
              "
            >

              {/* NAME */}

              <div>

                <label className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  mb-1.5
                ">
                  Item Name
                </label>

                <input
                  type="text"
                  value={
                    form.itemName
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      itemName:
                        e.target.value,
                    })
                  }
                  placeholder="e.g. Tomatoes"
                  className="
                    w-full
                    h-11
                    px-4
                    rounded-xl
                    border
                    border-gray-200
                    outline-none
                    text-sm
                    focus:border-orange-400
                    focus:ring-2
                    focus:ring-orange-100
                  "
                  required
                />

              </div>

              {/* CATEGORY + UNIT */}

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-1.5
                  ">
                    Category
                  </label>

                  <select
                    value={
                      form.category
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      outline-none
                      text-sm
                      focus:border-orange-400
                    "
                  >

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {category}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-1.5
                  ">
                    Unit
                  </label>

                  <select
                    value={
                      form.unit
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        unit:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      outline-none
                      text-sm
                      focus:border-orange-400
                    "
                  >

                    {units.map(
                      (unit) => (
                        <option
                          key={unit}
                          value={unit}
                        >
                          {unit}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* QUANTITY + MINIMUM */}

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-1.5
                  ">
                    Current Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      form.quantity
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity:
                          e.target.value,
                      })
                    }
                    placeholder="0"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-gray-200
                      outline-none
                      text-sm
                      focus:border-orange-400
                      focus:ring-2
                      focus:ring-orange-100
                    "
                    required
                  />

                </div>

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-1.5
                  ">
                    Minimum Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      form.minimumStock
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        minimumStock:
                          e.target.value,
                      })
                    }
                    placeholder="5"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-gray-200
                      outline-none
                      text-sm
                      focus:border-orange-400
                      focus:ring-2
                      focus:ring-orange-100
                    "
                    required
                  />

                </div>

              </div>

              {/* SUPPLIER + PRICE */}

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-1.5
                  ">
                    Supplier
                  </label>

                  <input
                    type="text"
                    value={
                      form.supplier
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        supplier:
                          e.target.value,
                      })
                    }
                    placeholder="Supplier name"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-gray-200
                      outline-none
                      text-sm
                      focus:border-orange-400
                      focus:ring-2
                      focus:ring-orange-100
                    "
                  />

                </div>

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-1.5
                  ">
                    Unit Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      form.price
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price:
                          e.target.value,
                      })
                    }
                    placeholder="0"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border
                      border-gray-200
                      outline-none
                      text-sm
                      focus:border-orange-400
                      focus:ring-2
                      focus:ring-orange-100
                    "
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div className="
                pt-2
                flex
                flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="
                    w-full
                    sm:w-auto
                    px-5
                    py-2.5
                    rounded-xl
                    border
                    border-gray-200
                    text-gray-600
                    text-sm
                    font-semibold
                    hover:bg-gray-50
                    disabled:opacity-60
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    w-full
                    sm:w-auto
                    px-5
                    py-2.5
                    rounded-xl
                    bg-orange-500
                    text-white
                    text-sm
                    font-semibold
                    hover:bg-orange-600
                    disabled:opacity-60
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingItem
                    ? "Update Item"
                    : "Add Item"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default OwnerInventory;