import { useEffect, useState } from "react";
import {
  Armchair,
  Plus,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getTables,
  createTable,
  updateTableStatus,
  deleteTable,
} from "../../services/tableService";

type Table = {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
};

function Tables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("4");

  const [error, setError] = useState("");

  // =========================
  // LOAD TABLES
  // =========================
  const loadTables = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTables();

      setTables(response.data.tables || []);
    } catch (err: any) {
      console.error("Failed to load tables:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load tables"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  // =========================
  // CREATE TABLE
  // =========================
  const handleCreateTable = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const number = Number(tableNumber);
    const seats = Number(capacity);

    if (!number || number < 1) {
      setError("Please enter a valid table number");
      return;
    }

    if (!seats || seats < 1) {
      setError("Please enter a valid capacity");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await createTable({
        tableNumber: number,
        capacity: seats,
      });

      setTables((prev) =>
        [...prev, response.data.table].sort(
          (a, b) => a.tableNumber - b.tableNumber
        )
      );

      setTableNumber("");
      setCapacity("4");
      setShowModal(false);
    } catch (err: any) {
      console.error("Create table error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to create table"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // STATUS UPDATE
  // =========================
  const handleStatusChange = async (
    id: string,
    status: Table["status"]
  ) => {
    try {
      setError("");

      const response = await updateTableStatus(
        id,
        status
      );

      setTables((prev) =>
        prev.map((table) =>
          table._id === id
            ? response.data.table
            : table
        )
      );
    } catch (err: any) {
      console.error("Update table error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to update table status"
      );
    }
  };

  // =========================
  // DELETE TABLE
  // =========================
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this table?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteTable(id);

      setTables((prev) =>
        prev.filter((table) => table._id !== id)
      );
    } catch (err: any) {
      console.error("Delete table error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to delete table"
      );
    }
  };

  const availableCount = tables.filter(
    (table) => table.status === "available"
  ).length;

  const occupiedCount = tables.filter(
    (table) => table.status === "occupied"
  ).length;

  const reservedCount = tables.filter(
    (table) => table.status === "reserved"
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#172033]">
<main className="px-4 pb-8 pt-0 sm:px-6 sm:pt-2 lg:px-8 lg:pt-2">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-orange-500 font-semibold">
              Restaurant Management
            </p>

            <h1 className="mt-2 text-2xl sm:text-3xl font-bold">
              Tables
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your restaurant tables and their
              availability.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={loadTables}
              className="
                inline-flex items-center justify-center
                gap-2
                rounded-xl
                border border-gray-200
                bg-white
                px-4 py-3
                text-sm font-medium
                hover:bg-gray-50
                transition
              "
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowModal(true);
              }}
              className="
                inline-flex items-center justify-center
                gap-2
                rounded-xl
                bg-orange-500
                px-4 py-3
                text-sm font-semibold
                text-white
                hover:bg-orange-600
                transition
              "
            >
              <Plus size={18} />
              Add Table
            </button>

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="
            mb-5
            rounded-xl
            border border-red-200
            bg-red-50
            px-4 py-3
            text-sm text-red-600
          ">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <section className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-4
          mb-6
        ">

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Tables
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              {tables.length}
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Available
            </p>
            <h2 className="mt-2 text-2xl font-bold text-green-600">
              {availableCount}
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Occupied
            </p>
            <h2 className="mt-2 text-2xl font-bold text-orange-500">
              {occupiedCount}
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Reserved
            </p>
            <h2 className="mt-2 text-2xl font-bold text-blue-600">
              {reservedCount}
            </h2>
          </div>

        </section>

        {/* TABLE LIST */}
        <section className="
          bg-white
          border border-gray-200
          rounded-2xl
          shadow-sm
          p-4 sm:p-6
        ">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">
                Restaurant Tables
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {tables.length} table
                {tables.length !== 1 ? "s" : ""} configured
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading tables...
            </div>
          ) : tables.length === 0 ? (
            <div className="
              py-16
              text-center
              border border-dashed
              border-gray-200
              rounded-2xl
            ">
              <Armchair
                size={42}
                className="mx-auto text-orange-500 mb-4"
              />

              <h3 className="text-lg font-semibold">
                No tables added yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add your first restaurant table to get started.
              </p>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="
                  mt-5
                  rounded-xl
                  bg-orange-500
                  px-5 py-2.5
                  text-sm font-semibold
                  text-white
                  hover:bg-orange-600
                "
              >
                Add First Table
              </button>
            </div>
          ) : (
            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-4
            ">

              {tables.map((table) => (
                <div
                  key={table._id}
                  className="
                    rounded-2xl
                    border border-gray-200
                    p-5
                    hover:shadow-md
                    transition
                  "
                >

                  <div className="flex items-start justify-between">

                    <div className="
                      w-11 h-11
                      rounded-xl
                      bg-orange-50
                      text-orange-500
                      flex items-center justify-center
                    ">
                      <Armchair size={22} />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(table._id)
                      }
                      className="
                        p-2
                        rounded-lg
                        text-gray-400
                        hover:bg-red-50
                        hover:text-red-500
                        transition
                      "
                      title="Delete table"
                    >
                      <Trash2 size={17} />
                    </button>

                  </div>

                  <h3 className="mt-4 text-lg font-bold">
                    Table {table.tableNumber}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Capacity: {table.capacity} seats
                  </p>

                  <div className="mt-4">

                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Status
                    </label>

                    <select
                      value={table.status}
                      onChange={(e) =>
                        handleStatusChange(
                          table._id,
                          e.target.value as Table["status"]
                        )
                      }
                      className="
                        w-full
                        rounded-xl
                        border border-gray-200
                        bg-white
                        px-3 py-2.5
                        text-sm
                        outline-none
                        focus:border-orange-500
                        focus:ring-2
                        focus:ring-orange-100
                      "
                    >
                      <option value="available">
                        Available
                      </option>

                      <option value="occupied">
                        Occupied
                      </option>

                      <option value="reserved">
                        Reserved
                      </option>
                    </select>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </main>

      {/* ADD TABLE MODAL */}
      {showModal && (
        <div className="
          fixed inset-0
          z-[100]
          flex items-center justify-center
          bg-black/40
          p-4
        ">

          <div className="
            w-full max-w-md
            rounded-2xl
            bg-white
            p-6
            shadow-xl
          ">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-bold">
                  Add New Table
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a table to your restaurant.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="
                  rounded-lg
                  p-2
                  text-gray-400
                  hover:bg-gray-100
                "
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleCreateTable}
              className="space-y-4"
            >

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Table Number
                </label>

                <input
                  type="number"
                  min="1"
                  value={tableNumber}
                  onChange={(e) =>
                    setTableNumber(e.target.value)
                  }
                  placeholder="e.g. 1"
                  className="
                    w-full
                    rounded-xl
                    border border-gray-200
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                    focus:ring-2
                    focus:ring-orange-100
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Capacity
                </label>

                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) =>
                    setCapacity(e.target.value)
                  }
                  placeholder="e.g. 4"
                  className="
                    w-full
                    rounded-xl
                    border border-gray-200
                    px-4 py-3
                    outline-none
                    focus:border-orange-500
                    focus:ring-2
                    focus:ring-orange-100
                  "
                />
              </div>

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="
                    flex-1
                    rounded-xl
                    border border-gray-200
                    px-4 py-3
                    text-sm font-semibold
                    hover:bg-gray-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    flex-1
                    rounded-xl
                    bg-orange-500
                    px-4 py-3
                    text-sm font-semibold
                    text-white
                    hover:bg-orange-600
                    disabled:opacity-50
                  "
                >
                  {saving ? "Adding..." : "Add Table"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Tables;