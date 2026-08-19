import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Mail,
  Phone,
} from "lucide-react";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
  type EmployeeRole,
} from "../../services/employeeService";

const roles = [
  {
    value: "manager",
    label: "Manager",
  },
  {
    value: "waiter",
    label: "Waiter",
  },
  {
    value: "kitchen",
    label: "Kitchen",
  },
];

function OwnerEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

 const [form, setForm] = useState<{
  fullName: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  password: string;
  confirmPassword: string;
}>({
  fullName: "",
  email: "",
  phone: "",
  role: "waiter",
  password: "",
  confirmPassword: "",
});

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const response = await getEmployees();

      setEmployees(response.data || []);
    } catch (error) {
      console.error(
        "LOAD EMPLOYEES ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !value ||
        employee.fullName
          ?.toLowerCase()
          .includes(value) ||
        employee.email
          ?.toLowerCase()
          .includes(value) ||
        employee.phone
          ?.toLowerCase()
          .includes(value);

      const matchesRole =
        roleFilter === "all" ||
        employee.role === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });
  }, [
    employees,
    search,
    roleFilter,
  ]);

  const managerCount = employees.filter(
    (employee) =>
      employee.role === "manager"
  ).length;

  const waiterCount = employees.filter(
    (employee) =>
      employee.role === "waiter"
  ).length;

  const kitchenCount = employees.filter(
    (employee) =>
      employee.role === "kitchen"
  ).length;

  const resetForm = () => {
  setForm({
    fullName: "",
    email: "",
    phone: "",
    role: "waiter" as EmployeeRole,
    password: "",
    confirmPassword: "",
  });

  setEditingEmployee(null);
};


  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (
    employee: Employee
  ) => {
    setEditingEmployee(employee);

    setForm({
      fullName:
        employee.fullName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role || "waiter",
      password: "",
      confirmPassword: "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.fullName.trim()) {
      alert("Please enter employee name.");
      return;
    }

    if (!form.email.trim()) {
      alert("Please enter employee email.");
      return;
    }

    if (!editingEmployee) {
      if (!form.password) {
        alert(
          "Please create a password for the employee."
        );
        return;
      }

      if (form.password.length < 8) {
        alert(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (
        form.password !==
        form.confirmPassword
      ) {
        alert(
          "Passwords do not match."
        );
        return;
      }
    }

    if (
      editingEmployee &&
      form.password &&
      form.password.length < 8
    ) {
      alert(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      editingEmployee &&
      form.password &&
      form.password !==
        form.confirmPassword
    ) {
      alert(
        "Passwords do not match."
      );
      return;
    }

    try {
      setSaving(true);

      if (editingEmployee) {
        await updateEmployee(
          editingEmployee._id,
          {
            fullName:
              form.fullName.trim(),
            email:
              form.email.trim(),
            phone:
              form.phone.trim(),
            role: form.role,
            ...(form.password
              ? {
                  password:
                    form.password,
                }
              : {}),
          }
        );
      } else {
        await createEmployee({
          fullName:
            form.fullName.trim(),
          email:
            form.email.trim(),
          phone:
            form.phone.trim(),
          role: form.role,
          password:
            form.password,
        });
      }

      setShowModal(false);
      resetForm();

      await loadEmployees();
    } catch (error: any) {
      console.error(
        "SAVE EMPLOYEE ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to save employee."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    employee: Employee
  ) => {
    const confirmed = window.confirm(
      `Delete ${employee.fullName}'s employee account?`
    );

    if (!confirmed) return;

    try {
      await deleteEmployee(
        employee._id
      );

      await loadEmployees();
    } catch (error: any) {
      console.error(
        "DELETE EMPLOYEE ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete employee."
      );
    }
  };

  const getRoleLabel = (
    role: string
  ) => {
    if (role === "manager")
      return "Manager";

    if (role === "waiter")
      return "Waiter";

    if (role === "kitchen")
      return "Kitchen";

    return role;
  };

  const getRoleStyle = (
    role: string
  ) => {
    if (role === "manager") {
      return "bg-purple-50 text-purple-600";
    }

    if (role === "kitchen") {
      return "bg-blue-50 text-blue-600";
    }

    return "bg-orange-50 text-orange-600";
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f7f8]">

      {/* HEADER */}
<div className="w-full px-4 sm:px-6 lg:px-8 pt-0 -mt-8">
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
              Employees
            </h1>

            <p className="
              mt-1
              text-sm
              sm:text-base
              text-gray-500
            ">
              Manage your restaurant staff and
              their login credentials.
            </p>
          </div>

          <div className="
            flex flex-col
            sm:flex-row
            gap-3
          ">

            <button
              type="button"
              onClick={loadEmployees}
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
              onClick={openAddModal}
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
                transition
              "
            >
              <UserPlus size={17} />

              Add Employee
            </button>

          </div>

        </div>

      </div>

      {/* SUMMARY */}
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
                <p className="
                  text-sm
                  text-gray-500
                ">
                  Total Employees
                </p>

                <h2 className="
                  mt-1
                  text-2xl
                  font-bold
                  text-[#172033]
                ">
                  {employees.length}
                </h2>
              </div>

              <div className="
                w-11 h-11
                rounded-xl
                bg-orange-50
                text-orange-500
                flex
                items-center
                justify-center
              ">
                <Users size={21} />
              </div>

            </div>

          </div>

          {/* MANAGERS */}
          <div className="
            bg-white
            border border-gray-200
            rounded-2xl
            p-5
            shadow-sm
          ">

            <p className="
              text-sm
              text-gray-500
            ">
              Managers
            </p>

            <h2 className="
              mt-1
              text-2xl
              font-bold
            ">
              {managerCount}
            </h2>

            <p className="
              mt-2
              text-xs
              text-gray-400
            ">
              Restaurant managers
            </p>

          </div>

          {/* WAITERS */}
          <div className="
            bg-white
            border border-gray-200
            rounded-2xl
            p-5
            shadow-sm
          ">

            <p className="
              text-sm
              text-gray-500
            ">
              Waiters
            </p>

            <h2 className="
              mt-1
              text-2xl
              font-bold
            ">
              {waiterCount}
            </h2>

            <p className="
              mt-2
              text-xs
              text-gray-400
            ">
              Service staff
            </p>

          </div>

          {/* KITCHEN */}
          <div className="
            bg-white
            border border-gray-200
            rounded-2xl
            p-5
            shadow-sm
          ">

            <p className="
              text-sm
              text-gray-500
            ">
              Kitchen Staff
            </p>

            <h2 className="
              mt-1
              text-2xl
              font-bold
            ">
              {kitchenCount}
            </h2>

            <p className="
              mt-2
              text-xs
              text-gray-400
            ">
              Kitchen team
            </p>

          </div>

        </div>

      </div>

      {/* EMPLOYEE LIST */}
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
                  Restaurant Staff
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  Employees created by the owner.
                </p>
              </div>

              <div className="
                flex flex-col
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
                    placeholder="Search employee..."
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

                {/* ROLE */}
                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(
                      e.target.value
                    )
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
                    All Roles
                  </option>

                  <option value="manager">
                    Managers
                  </option>

                  <option value="waiter">
                    Waiters
                  </option>

                  <option value="kitchen">
                    Kitchen
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
                    Loading employees...
                  </p>

                </div>

              </div>

            ) : filteredEmployees.length === 0 ? (

              <div className="
                min-h-[300px]
                flex
                items-center
                justify-center
                text-center
                px-4
              ">

                <div>

                  <Users
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
                    roleFilter !== "all"
                      ? "No employees found"
                      : "No employees yet"}
                  </h3>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-400
                    max-w-sm
                  ">
                    {search ||
                    roleFilter !== "all"
                      ? "Try another search or role filter."
                      : "Add your first restaurant employee to get started."}
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

                {filteredEmployees.map(
                  (employee) => (

                    <div
                      key={
                        employee._id
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
                            w-11 h-11
                            shrink-0
                            rounded-xl
                            bg-orange-50
                            text-orange-500
                            flex
                            items-center
                            justify-center
                            font-bold
                          ">
                            {employee.fullName
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                         <div className="
  min-w-0
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
    {employee.fullName}
  </h3>

  <span className={`
    inline-flex
    px-2.5
    py-1
    rounded-full
    text-xs
    font-medium
    ${getRoleStyle(
      employee.role
    )}
  `}>
    {getRoleLabel(
      employee.role
    )}
  </span>

</div>

                        </div>

                        <div className="
                          flex
                          items-center
                          gap-1
                        ">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                employee
                              )
                            }
                            className="
                              w-9 h-9
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              text-gray-500
                              hover:bg-orange-50
                              hover:text-orange-600
                              transition
                            "
                            title="Edit employee"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                employee
                              )
                            }
                            className="
                              w-9 h-9
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              text-gray-400
                              hover:bg-red-50
                              hover:text-red-500
                              transition
                            "
                            title="Delete employee"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

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
                            {employee.email}
                          </span>
                        </div>

                        {employee.phone && (
                          <div className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            text-gray-500
                          ">
                            <Phone
                              size={15}
                            />

                            <span>
                              {employee.phone}
                            </span>
                          </div>
                        )}

                      </div>

                      {/* FOOTER */}
                      <div className="
  mt-4
  pt-4
  border-t
  border-gray-100
  flex
  items-center
  gap-2
  text-xs
  text-gray-400
">
  <ShieldCheck
    size={14}
    className="text-green-500"
  />

  Login Email: {employee.email}
</div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ADD / EDIT MODAL */}
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
            max-w-lg
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
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  {editingEmployee
                    ? "Update employee details and credentials."
                    : "Create login credentials for your employee."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="
                  w-9 h-9
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
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 space-y-4"
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
                  Full Name
                </label>

                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fullName:
                        e.target.value,
                    })
                  }
                  placeholder="Enter employee name"
                  className="
                    w-full
                    h-11
                    px-4
                    rounded-xl
                    border border-gray-200
                    outline-none
                    text-sm
                    focus:border-orange-400
                    focus:ring-2
                    focus:ring-orange-100
                  "
                  required
                />

              </div>

              {/* EMAIL */}
              <div>

                <label className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  mb-1.5
                ">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email:
                        e.target.value,
                    })
                  }
                  placeholder="employee@example.com"
                  className="
                    w-full
                    h-11
                    px-4
                    rounded-xl
                    border border-gray-200
                    outline-none
                    text-sm
                    focus:border-orange-400
                    focus:ring-2
                    focus:ring-orange-100
                  "
                  required
                />

              </div>

              {/* PHONE + ROLE */}
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
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone:
                          e.target.value,
                      })
                    }
                    placeholder="Phone number"
                    className="
                      w-full
                      h-11
                      px-4
                      rounded-xl
                      border border-gray-200
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
                    Role
                  </label>

                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role:
  e.target.value as EmployeeRole,
                      })
                    }
                    className="
                      w-full
                      h-11
                      px-3
                      rounded-xl
                      border border-gray-200
                      bg-white
                      outline-none
                      text-sm
                      focus:border-orange-400
                    "
                  >

                    {roles.map(
                      (role) => (
                        <option
                          key={
                            role.value
                          }
                          value={
                            role.value
                          }
                        >
                          {role.label}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <label className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  mb-1.5
                ">
                  {editingEmployee
                    ? "New Password"
                    : "Password"}
                </label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password:
                        e.target.value,
                    })
                  }
                  placeholder={
                    editingEmployee
                      ? "Leave blank to keep current password"
                      : "Create employee password"
                  }
                  className="
                    w-full
                    h-11
                    px-4
                    rounded-xl
                    border border-gray-200
                    outline-none
                    text-sm
                    focus:border-orange-400
                    focus:ring-2
                    focus:ring-orange-100
                  "
                  required={!editingEmployee}
                />

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  mb-1.5
                ">
                  {editingEmployee
                    ? "Confirm New Password"
                    : "Confirm Password"}
                </label>

                <input
                  type="password"
                  value={
                    form.confirmPassword
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      confirmPassword:
                        e.target.value,
                    })
                  }
                  placeholder="Confirm password"
                  className="
                    w-full
                    h-11
                    px-4
                    rounded-xl
                    border border-gray-200
                    outline-none
                    text-sm
                    focus:border-orange-400
                    focus:ring-2
                    focus:ring-orange-100
                  "
                  required={!editingEmployee}
                />

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
                  onClick={closeModal}
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

                  {editingEmployee
                    ? "Update Employee"
                    : "Create Employee"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default OwnerEmployees;