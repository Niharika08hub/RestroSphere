import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  ShoppingBag,
  IndianRupee,
  CalendarDays,
  UserRound,
} from "lucide-react";

import {
  getCustomers,
  type Customer,
} from "../../services/customerService";

function OwnerCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const data = await getCustomers();

      setCustomers(data.customers || []);
    } catch (error) {
      console.error("CUSTOMERS LOAD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return customers;

    return customers.filter((customer) => {
      return (
        customer.fullName
          ?.toLowerCase()
          .includes(value) ||
        customer.email
          ?.toLowerCase()
          .includes(value) ||
        customer.phone
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [customers, search]);

  const totalOrders = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.totalOrders || 0),
    0
  );

  const totalRevenue = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.totalSpent || 0),
    0
  );

  const formatDate = (date?: string | null) => {
    if (!date) return "No orders yet";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f7f8]">

      {/* HEADER */}
      <div className="
        w-full
        px-4 sm:px-6 lg:px-8
        pt-2 sm:pt-3
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
              Customers
            </h1>

            <p className="
              mt-1
              text-sm
              sm:text-base
              text-gray-500
            ">
              View and manage your restaurant customers.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCustomers}
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
        px-4 sm:px-6 lg:px-8
        mt-6
      ">

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-4
        ">

          {/* CUSTOMERS */}
          <div className="
            bg-white
            border border-gray-200
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
                <p className="text-sm text-gray-500">
                  Total Customers
                </p>

                <h2 className="
                  mt-1
                  text-2xl
                  font-bold
                  text-[#172033]
                ">
                  {customers.length}
                </h2>
              </div>

              <div className="
                w-11 h-11
                rounded-xl
                bg-orange-50
                text-orange-500
                flex items-center justify-center
              ">
                <Users size={21} />
              </div>

            </div>

            <p className="
              mt-3
              text-xs
              text-gray-400
            ">
              Registered customers
            </p>

          </div>

          {/* ORDERS */}
          <div className="
            bg-white
            border border-gray-200
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
                <p className="text-sm text-gray-500">
                  Customer Orders
                </p>

                <h2 className="
                  mt-1
                  text-2xl
                  font-bold
                  text-[#172033]
                ">
                  {totalOrders}
                </h2>
              </div>

              <div className="
                w-11 h-11
                rounded-xl
                bg-blue-50
                text-blue-500
                flex items-center justify-center
              ">
                <ShoppingBag size={21} />
              </div>

            </div>

            <p className="
              mt-3
              text-xs
              text-gray-400
            ">
              Orders placed by customers
            </p>

          </div>

          {/* REVENUE */}
          <div className="
            bg-white
            border border-gray-200
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
                <p className="text-sm text-gray-500">
                  Customer Revenue
                </p>

                <h2 className="
                  mt-1
                  text-2xl
                  font-bold
                  text-[#172033]
                ">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </h2>
              </div>

              <div className="
                w-11 h-11
                rounded-xl
                bg-green-50
                text-green-600
                flex items-center justify-center
              ">
                <IndianRupee size={21} />
              </div>

            </div>

            <p className="
              mt-3
              text-xs
              text-gray-400
            ">
              Revenue from customer orders
            </p>

          </div>

        </div>

      </div>

      {/* CUSTOMER LIST */}
      <div className="
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

          {/* LIST HEADER */}
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
                <h2 className="
                  text-lg
                  sm:text-xl
                  font-bold
                ">
                  Restaurant Customers
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  Search and view customer activity.
                </p>
              </div>

              {/* SEARCH */}
              <div className="
                relative
                w-full
                lg:w-80
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
                    setSearch(e.target.value)
                  }
                  placeholder="Search customer..."
                  className="
                    w-full
                    h-11
                    pl-10
                    pr-4
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

            </div>

          </div>

          {/* CUSTOMER CONTENT */}
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
                    Loading customers...
                  </p>

                </div>

              </div>

            ) : filteredCustomers.length === 0 ? (

              <div className="
                min-h-[300px]
                flex
                items-center
                justify-center
                text-center
                px-4
              ">

                <div>

                  <UserRound
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
                    {search
                      ? "No customers found"
                      : "No customers yet"}
                  </h3>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-400
                    max-w-sm
                  ">
                    {search
                      ? "Try searching with another name, email or phone number."
                      : "Customers will appear here when they register and place orders."}
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

                {filteredCustomers.map(
                  (customer) => (

                    <div
                      key={customer._id}
                      className="
                        border
                        border-gray-200
                        rounded-2xl
                        p-4 sm:p-5
                        hover:border-orange-200
                        transition
                      "
                    >

                      {/* CUSTOMER HEADER */}
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
                            w-11 h-11
                            shrink-0
                            rounded-xl
                            bg-orange-50
                            text-orange-500
                            flex
                            items-center
                            justify-center
                          ">
                            <UserRound size={20} />
                          </div>

                          <div className="min-w-0">

                            <h3 className="
                              font-semibold
                              text-gray-800
                              truncate
                            ">
                              {customer.fullName}
                            </h3>

                            <p className="
                              text-xs
                              text-gray-400
                              mt-0.5
                            ">
                              Customer
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* CONTACT */}
                      <div className="
                        mt-4
                        space-y-2
                      ">

                        <div className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          text-gray-500
                        ">
                          <Mail size={15} />
                          <span className="truncate">
                            {customer.email}
                          </span>
                        </div>

                        {customer.phone && (
                          <div className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            text-gray-500
                          ">
                            <Phone size={15} />
                            <span>
                              {customer.phone}
                            </span>
                          </div>
                        )}

                      </div>

                      {/* STATS */}
                      <div className="
                        grid
                        grid-cols-2
                        gap-3
                        mt-5
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
                            Orders
                          </p>

                          <p className="
                            mt-1
                            font-bold
                            text-gray-800
                          ">
                            {customer.totalOrders}
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
                            Total Spent
                          </p>

                          <p className="
                            mt-1
                            font-bold
                            text-gray-800
                          ">
                            ₹
                            {Number(
                              customer.totalSpent || 0
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>

                      </div>

                      {/* LAST ORDER */}
                      <div className="
                        mt-4
                        pt-4
                        border-t
                        border-gray-100
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-2
                      ">

                        <div className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-gray-500
                        ">
                          <CalendarDays size={14} />

                          <span>
                            Last order
                          </span>
                        </div>

                        <span className="
                          text-xs
                          font-medium
                          text-gray-700
                        ">
                          {formatDate(
                            customer.lastOrder
                          )}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default OwnerCustomers;