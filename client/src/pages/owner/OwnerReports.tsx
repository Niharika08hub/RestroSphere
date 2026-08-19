import { useEffect, useState } from "react";
import {
  FileText,
  IndianRupee,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock3,
  ChefHat,
  PackageCheck,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import {
  getReport,
  type ReportData,
} from "../../services/reportService";

function OwnerReports() {
  const [report, setReport] =
    useState<ReportData | null>(null);

  const [range, setRange] = useState<
    "today" | "7d" | "30d"
  >("7d");

  const [loading, setLoading] =
    useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);

      const response =
        await getReport(range);

      setReport(
        response.data || null
      );
    } catch (error: any) {
      console.error(
        "LOAD REPORT ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [range]);

  const summary = report?.summary;

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



  return (
    <div
      className="
        w-full
        min-h-screen
        bg-[#f7f7f8]
        -mt-8
      "
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <div
        className="
          w-full
          px-4 sm:px-6 lg:px-8
          pt-0
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
          "
        >
          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-[0.16em]
                text-orange-500
                font-semibold
              "
            >
              Restaurant Management
            </p>

            <h1
              className="
                mt-1
                text-2xl
                sm:text-3xl
                font-bold
                text-[#172033]
              "
            >
              Reports
            </h1>

            <p
              className="
                mt-1
                text-sm
                sm:text-base
                text-gray-500
              "
            >
              View detailed restaurant
              performance reports.
            </p>
          </div>

          <div
            className="
              flex
              flex-col
              sm:flex-row
              gap-3
            "
          >
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

            <button
              type="button"
              onClick={loadReport}
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
        <div
          className="
            px-4 sm:px-6 lg:px-8
            py-10
          "
        >
          <div
            className="
              min-h-[500px]
              bg-white
              border
              border-gray-200
              rounded-2xl
              flex
              items-center
              justify-center
            "
          >
            <div className="text-center">
              <RefreshCw
                size={32}
                className="
                  mx-auto
                  text-orange-500
                  animate-spin
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  text-gray-500
                "
              >
                Generating report...
              </p>
            </div>
          </div>
        </div>
      ) : !report ? (
        <div
          className="
            px-4 sm:px-6 lg:px-8
            py-10
          "
        >
          <div
            className="
              min-h-[400px]
              bg-white
              border
              border-gray-200
              rounded-2xl
              flex
              items-center
              justify-center
              text-center
            "
          >
            <div>
              <FileText
                size={46}
                className="
                  mx-auto
                  mb-4
                  text-gray-300
                "
              />

              <h2
                className="
                  text-lg
                  font-semibold
                  text-gray-700
                "
              >
                No report available
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-400
                "
              >
                Reports will appear when
                restaurant order data is
                available.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* =====================================
              SUMMARY CARDS
          ===================================== */}

          <div
            className="
              px-4 sm:px-6 lg:px-8
              mt-6
            "
          >
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-4
                gap-4
              "
            >
              {/* REVENUE */}

              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      Revenue
                    </p>

                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-bold
                        text-[#172033]
                      "
                    >
                      {formatCurrency(
                        summary?.revenue || 0
                      )}
                    </h2>
                  </div>

                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-orange-50
                      text-orange-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <IndianRupee
                      size={21}
                    />
                  </div>
                </div>
              </div>

              {/* ORDERS */}

              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      Total Orders
                    </p>

                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-bold
                        text-[#172033]
                      "
                    >
                      {summary?.totalOrders ||
                        0}
                    </h2>
                  </div>

                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-blue-50
                      text-blue-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <ShoppingBag
                      size={21}
                    />
                  </div>
                </div>
              </div>

              {/* AOV */}

              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      Average Order Value
                    </p>

                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-bold
                        text-[#172033]
                      "
                    >
                      {formatCurrency(
                        summary?.averageOrderValue ||
                          0
                      )}
                    </h2>
                  </div>

                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-green-50
                      text-green-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <TrendingUp
                      size={21}
                    />
                  </div>
                </div>
              </div>

              {/* COMPLETED */}

              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      Completed Orders
                    </p>

                    <h2
                      className="
                        mt-1
                        text-2xl
                        font-bold
                        text-green-600
                      "
                    >
                      {summary?.completedOrders ||
                        0}
                    </h2>
                  </div>

                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-green-50
                      text-green-500
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <CheckCircle2
                      size={21}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================
              ORDER STATUS
          ===================================== */}

          <div
            className="
              px-4 sm:px-6 lg:px-8
              py-6
            "
          >
            <div
              className="
                bg-white
                border
                border-gray-200
                rounded-2xl
                shadow-sm
                p-4 sm:p-6
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    sm:text-xl
                    font-bold
                  "
                >
                  Order Status
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Breakdown of orders by
                  current status.
                </p>
              </div>

              <div
                className="
                  mt-5
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-5
                  gap-3
                "
              >
                <div
                  className="
                    rounded-xl
                    bg-gray-50
                    p-4
                  "
                >
                  <Clock3
                    size={20}
                    className="text-gray-500"
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      text-gray-500
                    "
                  >
                    Pending
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-bold
                    "
                  >
                    {summary?.pendingOrders ||
                      0}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    bg-orange-50
                    p-4
                  "
                >
                  <ChefHat
                    size={20}
                    className="text-orange-500"
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      text-gray-500
                    "
                  >
                    Preparing
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-bold
                    "
                  >
                    {summary?.preparingOrders ||
                      0}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    bg-blue-50
                    p-4
                  "
                >
                  <PackageCheck
                    size={20}
                    className="text-blue-500"
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      text-gray-500
                    "
                  >
                    Ready
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-bold
                    "
                  >
                    {summary?.readyOrders ||
                      0}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    bg-green-50
                    p-4
                  "
                >
                  <CheckCircle2
                    size={20}
                    className="text-green-500"
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      text-gray-500
                    "
                  >
                    Completed
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-bold
                      text-green-600
                    "
                  >
                    {summary?.completedOrders ||
                      0}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    bg-red-50
                    p-4
                  "
                >
                  <XCircle
                    size={20}
                    className="text-red-500"
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      text-gray-500
                    "
                  >
                    Cancelled
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-bold
                      text-red-600
                    "
                  >
                    {summary?.cancelledOrders ||
                      0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================
              DAILY REPORT + TOP ITEMS
          ===================================== */}

          <div
            className="
              px-4 sm:px-6 lg:px-8
              pb-6
            "
          >
            <div
              className="
                grid
                grid-cols-1
                xl:grid-cols-3
                gap-6
              "
            >
              {/* DAILY REVENUE */}

              <div
                className="
                  xl:col-span-2
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  shadow-sm
                  p-4 sm:p-6
                "
              >
                <div>
                  <h2
                    className="
                      text-lg
                      sm:text-xl
                      font-bold
                    "
                  >
                    Daily Report
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    Revenue and order
                    performance by day.
                  </p>
                </div>

                <div
                  className="
                    mt-6
                    overflow-x-auto
                  "
                >
                  <table className="
                    w-full
                    min-w-[620px]
                    text-sm
                  ">
                    <thead>
                      <tr className="
                        border-b
                        border-gray-100
                        text-left
                      ">
                        <th className="
                          py-3
                          pr-4
                          text-gray-500
                          font-medium
                        ">
                          Date
                        </th>

                        <th className="
                          py-3
                          px-4
                          text-gray-500
                          font-medium
                        ">
                          Orders
                        </th>

                        <th className="
                          py-3
                          px-4
                          text-gray-500
                          font-medium
                        ">
                          Completed
                        </th>

                        <th className="
                          py-3
                          px-4
                          text-gray-500
                          font-medium
                        ">
                          Cancelled
                        </th>

                        <th className="
                          py-3
                          pl-4
                          text-gray-500
                          font-medium
                          text-right
                        ">
                          Revenue
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {report.dailyReport.map(
                        (day) => (
                          <tr
                            key={day.date}
                            className="
                              border-b
                              border-gray-50
                              last:border-0
                            "
                          >
                            <td className="
                              py-3
                              pr-4
                              font-medium
                              text-gray-700
                            ">
                              {formatDate(
                                day.date
                              )}
                            </td>

                            <td className="
                              py-3
                              px-4
                              text-gray-600
                            ">
                              {day.orders}
                            </td>

                            <td className="
                              py-3
                              px-4
                              text-green-600
                              font-medium
                            ">
                              {day.completed}
                            </td>

                            <td className="
                              py-3
                              px-4
                              text-red-500
                              font-medium
                            ">
                              {day.cancelled}
                            </td>

                            <td className="
                              py-3
                              pl-4
                              text-right
                              font-semibold
                              text-gray-700
                            ">
                              {formatCurrency(
                                day.revenue
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TOP ITEMS */}

              <div
                className="
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  shadow-sm
                  p-4 sm:p-6
                "
              >
                <div>
                  <h2
                    className="
                      text-lg
                      sm:text-xl
                      font-bold
                    "
                  >
                    Item Performance
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    Items generating the most
                    revenue.
                  </p>
                </div>

                <div
                  className="
                    mt-5
                    space-y-3
                  "
                >
                  {report.itemReport.length ===
                  0 ? (
                    <div
                      className="
                        py-12
                        text-center
                      "
                    >
                      <FileText
                        size={34}
                        className="
                          mx-auto
                          text-gray-300
                        "
                      />

                      <p
                        className="
                          mt-3
                          text-sm
                          text-gray-400
                        "
                      >
                        No item data available.
                      </p>
                    </div>
                  ) : (
                    report.itemReport
                      .slice(0, 6)
                      .map(
                        (item, index) => (
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
                            <div
                              className="
                                flex
                                items-center
                                gap-3
                                min-w-0
                              "
                            >
                              <div
                                className="
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
                                "
                              >
                                {index + 1}
                              </div>

                              <div className="min-w-0">
                                <p
                                  className="
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    truncate
                                  "
                                >
                                  {item.name}
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    text-xs
                                    text-gray-400
                                  "
                                >
                                  {item.quantity}{" "}
                                  sold
                                </p>
                              </div>
                            </div>

                            <p
                              className="
                                shrink-0
                                text-sm
                                font-semibold
                                text-gray-700
                              "
                            >
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
              REPORT TOTAL
          ===================================== */}

          <div
            className="
              px-4 sm:px-6 lg:px-8
              pb-8
            "
          >
            <div
              className="
                bg-white
                border
                border-gray-200
                rounded-2xl
                shadow-sm
                p-4 sm:p-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >
                <div>
                  <h2
                    className="
                      text-lg
                      font-bold
                    "
                  >
                    Report Summary
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    Showing report for{" "}
                    {range === "today"
                      ? "today"
                      : range === "7d"
                      ? "the last 7 days"
                      : "the last 30 days"}
                    .
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-orange-600
                  "
                >
                  <TrendingUp
                    size={18}
                  />

                  {formatCurrency(
                    summary?.revenue || 0
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default OwnerReports;