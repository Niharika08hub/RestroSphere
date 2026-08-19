import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  RefreshCw,
  Users,
  Clock3,
  Armchair,
  Trash2,
} from "lucide-react";

import {
  getReservations,
  updateReservationStatus,
  deleteReservation,
  type Reservation,
  type ReservationStatus,
} from "../../services/reservationService";

function OwnerReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const loadReservations = async () => {
    try {
      setLoading(true);

      const data = await getReservations();

      setReservations(data.reservations || []);
    } catch (error) {
      console.error("RESERVATIONS LOAD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: ReservationStatus
  ) => {
    try {
      setActionLoading(id);

      const data = await updateReservationStatus(id, status);

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation._id === id
            ? data.reservation
            : reservation
        )
      );
    } catch (error) {
      console.error("RESERVATION STATUS ERROR:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reservation?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);

      await deleteReservation(id);

      setReservations((prev) =>
        prev.filter((reservation) => reservation._id !== id)
      );
    } catch (error) {
      console.error("DELETE RESERVATION ERROR:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const customerName =
        reservation.customerId?.name ||
        reservation.customerId?.fullName ||
        "Guest";

      const tableNumber =
        reservation.tableId?.tableNumber ?? "";

      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        customerName.toLowerCase().includes(searchValue) ||
        String(tableNumber).includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        reservation.status === statusFilter;

      const reservationDate = reservation.reservationDate
        ? new Date(reservation.reservationDate)
            .toISOString()
            .split("T")[0]
        : "";

      const matchesDate =
        !dateFilter ||
        reservationDate === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    reservations,
    search,
    statusFilter,
    dateFilter,
  ]);

  const counts = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter(
        (item) => item.status === "pending"
      ).length,
      confirmed: reservations.filter(
        (item) => item.status === "confirmed"
      ).length,
      completed: reservations.filter(
        (item) => item.status === "completed"
      ).length,
      cancelled: reservations.filter(
        (item) => item.status === "cancelled"
      ).length,
    };
  }, [reservations]);

  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f7f8]">

     {/* PAGE HEADER */}
  <div className="
  w-full
  px-4 sm:px-6 lg:px-8
  pt-0
">

        <div className="
          flex flex-col
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
              Reservations
            </h1>

            <p className="
              mt-1
              text-sm
              sm:text-base
              text-gray-500
            ">
              Manage your restaurant reservations and
              table bookings.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReservations}
            disabled={loading}
            className="
              w-full sm:w-auto
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
              disabled:opacity-60
              transition
            "
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

        </div>

      </div>

      {/* SUMMARY CARDS */}
      <div className="
        w-full
        px-4 sm:px-6 lg:px-8
        mt-6
      ">

        <div className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-3 sm:gap-4
        ">

          <div className="
            bg-white
            border border-gray-200
            rounded-2xl
            p-4 sm:p-5
            shadow-sm
          ">
            <p className="text-xs sm:text-sm text-gray-500">
              Total
            </p>

            <h2 className="mt-1 text-xl sm:text-2xl font-bold">
              {counts.total}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              All reservations
            </p>
          </div>

          <div className="
            bg-white
            border border-gray-200
            rounded-2xl
            p-4 sm:p-5
            shadow-sm
          ">
            <p className="text-xs sm:text-sm text-gray-500">
              Pending
            </p>

            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-orange-500">
              {counts.pending}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Awaiting confirmation
            </p>
          </div>

          <div className="
            bg-white
            border border-gray-200
            rounded-2xl
            p-4 sm:p-5
            shadow-sm
          ">
            <p className="text-xs sm:text-sm text-gray-500">
              Confirmed
            </p>

            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-green-600">
              {counts.confirmed}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Upcoming bookings
            </p>
          </div>

          <div className="
            bg-white
            border border-gray-200
            rounded-2xl
            p-4 sm:p-5
            shadow-sm
          ">
            <p className="text-xs sm:text-sm text-gray-500">
              Completed
            </p>

            <h2 className="mt-1 text-xl sm:text-2xl font-bold text-blue-600">
              {counts.completed}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Completed bookings
            </p>
          </div>

        </div>

      </div>

      {/* FILTERS + RESERVATIONS */}
      <div className="
        w-full
        px-4 sm:px-6 lg:px-8
        py-6 sm:py-8
      ">

        <div className="
          bg-white
          border border-gray-200
          rounded-2xl
          shadow-sm
          overflow-hidden
        ">

          {/* FILTER HEADER */}
          <div className="
            p-4 sm:p-6
            border-b border-gray-100
          ">

            <div className="
              flex flex-col
              lg:flex-row
              lg:items-center
              lg:justify-between
              gap-4
            ">

              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  Restaurant Reservations
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View and manage customer bookings.
                </p>
              </div>

              <div className="
                flex flex-col
                sm:flex-row
                gap-3
                w-full
                lg:w-auto
              ">

                {/* SEARCH */}
                <div className="relative w-full sm:w-64">

                  <Search
                    size={17}
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
                      setSearch(e.target.value)
                    }
                    placeholder="Search customer or table..."
                    className="
                      w-full
                      h-11
                      pl-9
                      pr-3
                      rounded-xl
                      border border-gray-200
                      bg-gray-50
                      text-sm
                      outline-none
                      focus:border-orange-400
                      focus:ring-2
                      focus:ring-orange-100
                    "
                  />

                </div>

                {/* STATUS */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="
                    h-11
                    px-3
                    rounded-xl
                    border border-gray-200
                    bg-white
                    text-sm
                    outline-none
                    focus:border-orange-400
                  "
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="confirmed">
                    Confirmed
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>

                {/* DATE */}
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value)
                  }
                  className="
                    h-11
                    px-3
                    rounded-xl
                    border border-gray-200
                    bg-white
                    text-sm
                    outline-none
                    focus:border-orange-400
                  "
                />

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

                  <p className="mt-3 text-sm text-gray-500">
                    Loading reservations...
                  </p>

                </div>
              </div>

            ) : filteredReservations.length === 0 ? (

              <div className="
                min-h-[300px]
                flex
                items-center
                justify-center
                text-center
                px-4
              ">

                <div>

                  <CalendarDays
                    size={42}
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
                    No reservations found
                  </h3>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-400
                    max-w-sm
                  ">
                    Customer reservations will appear
                    here when they book a table.
                  </p>

                </div>

              </div>

            ) : (

              <div className="space-y-4">

                {filteredReservations.map(
                  (reservation) => {

                    const customerName =
                      reservation.customerId?.name ||
                      reservation.customerId?.fullName ||
                      "Guest";

                    const customerEmail =
                      reservation.customerId?.email ||
                      "";

                    const tableNumber =
                      reservation.tableId?.tableNumber ??
                      "—";

                    return (
                      <div
                        key={reservation._id}
                        className="
                          border
                          border-gray-200
                          rounded-2xl
                          p-4 sm:p-5
                          hover:border-orange-200
                          transition
                        "
                      >

                        <div className="
                          flex
                          flex-col
                          xl:flex-row
                          xl:items-center
                          xl:justify-between
                          gap-5
                        ">

                          {/* CUSTOMER */}
                          <div className="min-w-0">

                            <div className="
                              flex
                              items-start
                              gap-3
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
                                <Users size={20} />
                              </div>

                              <div className="min-w-0">

                                <h3 className="
                                  font-semibold
                                  text-gray-800
                                ">
                                  {customerName}
                                </h3>

                                {customerEmail && (
                                  <p className="
                                    mt-0.5
                                    text-xs
                                    text-gray-400
                                    truncate
                                  ">
                                    {customerEmail}
                                  </p>
                                )}

                              </div>

                            </div>

                            {/* DETAILS */}
                            <div className="
                              mt-4
                              flex
                              flex-wrap
                              gap-x-5
                              gap-y-2
                              text-sm
                              text-gray-500
                            ">

                              <span className="
                                inline-flex
                                items-center
                                gap-1.5
                              ">
                                <CalendarDays size={15} />
                                {formatDate(
                                  reservation.reservationDate
                                )}
                              </span>

                              <span className="
                                inline-flex
                                items-center
                                gap-1.5
                              ">
                                <Clock3 size={15} />
                                {reservation.time}
                              </span>

                              <span className="
                                inline-flex
                                items-center
                                gap-1.5
                              ">
                                <Users size={15} />
                                {reservation.guests} Guests
                              </span>

                              <span className="
                                inline-flex
                                items-center
                                gap-1.5
                              ">
                                <Armchair size={15} />
                                Table {tableNumber}
                              </span>

                            </div>

                            {reservation.notes && (
                              <p className="
                                mt-3
                                text-sm
                                text-gray-500
                              ">
                                <span className="font-medium">
                                  Note:
                                </span>{" "}
                                {reservation.notes}
                              </p>
                            )}

                          </div>

                          {/* ACTIONS */}
                          <div className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            gap-3
                            xl:shrink-0
                          ">

                            <span className={`
                              inline-flex
                              items-center
                              justify-center
                              px-3
                              py-1.5
                              rounded-full
                              border
                              text-xs
                              font-semibold
                              capitalize
                              ${getStatusClass(
                                reservation.status
                              )}
                            `}>
                              {reservation.status}
                            </span>

                            <select
                              value={reservation.status}
                              disabled={
                                actionLoading ===
                                reservation._id
                              }
                              onChange={(e) =>
                                handleStatusChange(
                                  reservation._id,
                                  e.target.value as ReservationStatus
                                )
                              }
                              className="
                                h-10
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
                              <option value="pending">
                                Pending
                              </option>

                              <option value="confirmed">
                                Confirmed
                              </option>

                              <option value="completed">
                                Completed
                              </option>

                              <option value="cancelled">
                                Cancelled
                              </option>
                            </select>

                            <button
                              type="button"
                              disabled={
                                actionLoading ===
                                reservation._id
                              }
                              onClick={() =>
                                handleDelete(
                                  reservation._id
                                )
                              }
                              className="
                                h-10
                                px-3
                                rounded-xl
                                border
                                border-red-200
                                text-red-500
                                hover:bg-red-50
                                disabled:opacity-50
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                text-sm
                                font-medium
                                transition
                              "
                            >
                              <Trash2 size={16} />
                              <span className="sm:hidden">
                                Delete
                              </span>
                            </button>

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

    </div>
  );
}

export default OwnerReservations;