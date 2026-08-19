import { useEffect, useState } from "react";
import {
  BarChart3,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  RefreshCw,
  Package,
  XCircle,
} from "lucide-react";

import {
  getAnalytics,
  type AnalyticsData,
} from "../../services/analyticsService";

function OwnerAnalytics() {
  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [range, setRange] = useState<
    "today" | "7d" | "30d"
  >("7d");

  const [loading, setLoading] =
    useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const response =
        await getAnalytics(range);

      setAnalytics(
        response.data || null
      );
    } catch (error: any) {
      console.error(
        "LOAD ANALYTICS ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const stats = analytics?.stats;

  const formatCurrency = (
    value: number
  ) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  const maxRevenue =
    analytics?.dailyAnalytics?.length
      ? Math.max(
          ...analytics.dailyAnalytics.map(
            (day) =>
              Number(day.revenue || 0)
          ),
          1
        )
      : 1;

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
              Analytics
            </h1>

            <p className="
              mt-1
              text-sm
              sm:text-base
              text-gray-500
            ">
              Understand your restaurant
              performance and trends.
            </p>

          </div>

          <div className="
            flex
            flex-col
            sm:flex-row
            gap-3
          ">

            {/* RANGE */}

            <select
              value={range}
              onChange={(e) =>
                setRange(
                  e.target.value as
                    | "today"
                    | "7d"
                    | "30d"
                )
              }
              className="
                h-11
                px-4
                rounded-xl
                border
                border-gray-200
                bg-white
                text-sm
                font-medium
                outline-none
                focus:border-orange-400
              "
            >
              <option value="today">
                Today
              </option>

              <option value="7d">
                Last 7 Days
              </option>

              <option value="30d">
                Last 30 Days
              </option>
            </select>

            {/* REFRESH */}

            <button
              type="button"
              onClick={
                loadAnalytics
              }
              disabled={loading}
              className="
                h-11
                px-5
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-700
                text-sm
                font-semibold
                inline-flex
                items-center
                justify-center
                gap-2
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

          </div>

        </div>

      </div>

      {/* =====================================
          LOADING
      ===================================== */}

      {loading ? (

        <div className="
          px-4 sm:px-6 lg:px-8
          py-10
        ">

          <div className="
            min-h-[500px]
            bg-white
            border
            border-gray-200
            rounded-2xl
            flex
            items-center
            justify-center
          ">

            <div className="text-center">

              <RefreshCw
                size={32}
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
                Loading analytics...
              </p>

            </div>

          </div>

        </div>

      ) : !analytics ? (

        <div className="
          px-4 sm:px-6 lg:px-8
          py-10
        ">

          <div className="
            min-h-[400px]
            bg-white
            border
            border-gray-200
            rounded-2xl
            flex
            items-center
            justify-center
            text-center
          ">

            <div>

              <BarChart3
                size={46}
                className="
                  mx-auto
                  mb-4
                  text-gray-300
                "
              />

              <h2 className="
                text-lg
                font-semibold
                text-gray-700
              ">
                No analytics available
              </h2>

              <p className="
                mt-1
                text-sm
                text-gray-400
              ">
                Analytics will appear when
                restaurant order data is available.
              </p>

            </div>

          </div>

        </div>

      ) : (

        <>
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

              {/* REVENUE */}

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
                      Revenue
                    </p>

                    <h2 className="
                      mt-1
                      text-2xl
                      font-bold
                      text-[#172033]
                    ">
                      {formatCurrency(
                        stats?.revenue || 0
                      )}
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
                    <IndianRupee
                      size={21}
                    />
                  </div>

                </div>

              </div>

              {/* ORDERS */}

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
                      Total Orders
                    </p>

                    <h2 className="
                      mt-1
                      text-2xl
                      font-bold
                    ">
                      {stats?.totalOrders ||
                        0}
                    </h2>

                  </div>

                  <div className="
                    w-11
                    h-11
                    rounded-xl
                    bg-blue-50
                    text-blue-500
                    flex
                    items-center
                    justify-center
                  ">
                    <ShoppingBag
                      size={21}
                    />
                  </div>

                </div>

              </div>

              {/* AOV */}

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
                      Average Order Value
                    </p>

                    <h2 className="
                      mt-1
                      text-2xl
                      font-bold
                    ">
                      {formatCurrency(
                        stats?.averageOrderValue ||
                          0
                      )}
                    </h2>

                  </div>

                  <div className="
                    w-11
                    h-11
                    rounded-xl
                    bg-green-50
                    text-green-500
                    flex
                    items-center
                    justify-center
                  ">
                    <TrendingUp
                      size={21}
                    />
                  </div>

                </div>

              </div>

              {/* COMPLETED */}

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
                      Completed Orders
                    </p>

                    <h2 className="
                      mt-1
                      text-2xl
                      font-bold
                      text-green-600
                    ">
                      {stats?.completedOrders ||
                        0}
                    </h2>

                  </div>

                  <div className="
                    w-11
                    h-11
                    rounded-xl
                    bg-green-50
                    text-green-500
                    flex
                    items-center
                    justify-center
                  ">
                    <Package
                      size={21}
                    />
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =====================================
              CHART + TOP ITEMS
          ===================================== */}

          <div className="
            px-4 sm:px-6 lg:px-8
            py-6
          ">

            <div className="
              grid
              grid-cols-1
              xl:grid-cols-3
              gap-6
            ">

              {/* REVENUE CHART */}

              <div className="
                xl:col-span-2
                bg-white
                border
                border-gray-200
                rounded-2xl
                shadow-sm
                p-4 sm:p-6
              ">

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-3
                ">

                  <div>

                    <h2 className="
                      text-lg
                      sm:text-xl
                      font-bold
                    ">
                      Revenue Trend
                    </h2>

                    <p className="
                      mt-1
                      text-sm
                      text-gray-500
                    ">
                      Daily revenue performance
                    </p>

                  </div>

                  <BarChart3
                    size={21}
                    className="text-orange-500"
                  />

                </div>

               <div className="
  mt-6
  h-[190px]
  flex
  items-end
  gap-2
  sm:gap-4
  overflow-x-auto
  pb-2
">

                  {analytics.dailyAnalytics.map(
                    (day) => {

                      const height =
                        Math.max(
                          (Number(
                            day.revenue ||
                              0
                          ) /
                            maxRevenue) *
                            130,
                          day.revenue
                            ? 8
                            : 3
                        );

                      return (
                        <div
                          key={day.date}
                          className="
                            min-w-[38px]
                            sm:min-w-[48px]
                            h-full
                            flex
                            flex-col
                            items-center
                            justify-end
                            gap-2
                          "
                        >

                          <div className="
                            text-[10px]
                            sm:text-xs
                            text-gray-500
                            whitespace-nowrap
                          ">
                            {formatCurrency(
                              day.revenue
                            )}
                          </div>

                          <div
                            className="
                              w-7
                              sm:w-9
                              rounded-t-lg
                              bg-orange-400
                              hover:bg-orange-500
                              transition
                            "
                            style={{
                              height: `${height}px`,
                            }}
                            title={`${formatDate(
                              day.date
                            )}: ${formatCurrency(
                              day.revenue
                            )}`}
                          />

                          <div className="
                            text-[10px]
                            sm:text-xs
                            text-gray-400
                            whitespace-nowrap
                          ">
                            {formatDate(
                              day.date
                            )}
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* TOP ITEMS */}

              <div className="
                bg-white
                border
                border-gray-200
                rounded-2xl
                shadow-sm
                p-4 sm:p-6
              ">

                <div>

                  <h2 className="
                    text-lg
                    sm:text-xl
                    font-bold
                  ">
                    Top Selling Items
                  </h2>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-500
                  ">
                    Most ordered menu items
                  </p>

                </div>

                <div className="
                  mt-5
                  space-y-3
                ">

                  {analytics.topItems
                    .length === 0 ? (

                    <div className="
                      py-12
                      text-center
                    ">

                      <Package
                        size={34}
                        className="
                          mx-auto
                          text-gray-300
                        "
                      />

                      <p className="
                        mt-3
                        text-sm
                        text-gray-400
                      ">
                        No item data available.
                      </p>

                    </div>

                  ) : (

                    analytics.topItems.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          key={
                            item.name
                          }
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                            p-3
                            rounded-xl
                            bg-gray-50
                          "
                        >

                          <div className="
                            flex
                            items-center
                            gap-3
                            min-w-0
                          ">

                            <div className="
                              w-8
                              h-8
                              shrink-0
                              rounded-lg
                              bg-orange-50
                              text-orange-600
                              flex
                              items-center
                              justify-center
                              text-sm
                              font-bold
                            ">
                              {index + 1}
                            </div>

                            <div className="min-w-0">

                              <p className="
                                text-sm
                                font-semibold
                                text-gray-700
                                truncate
                              ">
                                {item.name}
                              </p>

                              <p className="
                                mt-0.5
                                text-xs
                                text-gray-400
                              ">
                                {item.quantity} sold
                              </p>

                            </div>

                          </div>

                          <p className="
                            shrink-0
                            text-sm
                            font-semibold
                            text-gray-700
                          ">
                            {formatCurrency(
                              item.revenue
                            )}
                          </p>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            </div>

          </div>

          {/* =====================================
              ORDER SUMMARY
          ===================================== */}

          <div className="
            px-4 sm:px-6 lg:px-8
            pb-8
          ">

            <div className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              shadow-sm
              p-4 sm:p-6
            ">

              <div>

                <h2 className="
                  text-lg
                  sm:text-xl
                  font-bold
                ">
                  Order Summary
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  Current order performance
                </p>

              </div>

              <div className="
                mt-5
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  p-4
                  rounded-xl
                  bg-green-50
                ">

                  <div>

                    <p className="
                      text-sm
                      text-gray-500
                    ">
                      Completed
                    </p>

                    <p className="
                      mt-1
                      text-xl
                      font-bold
                      text-green-600
                    ">
                      {stats?.completedOrders ||
                        0}
                    </p>

                  </div>

                  <Package
                    size={24}
                    className="text-green-500"
                  />

                </div>

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  p-4
                  rounded-xl
                  bg-red-50
                ">

                  <div>

                    <p className="
                      text-sm
                      text-gray-500
                    ">
                      Cancelled
                    </p>

                    <p className="
                      mt-1
                      text-xl
                      font-bold
                      text-red-600
                    ">
                      {stats?.cancelledOrders ||
                        0}
                    </p>

                  </div>

                  <XCircle
                    size={24}
                    className="text-red-500"
                  />

                </div>

              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}

export default OwnerAnalytics;