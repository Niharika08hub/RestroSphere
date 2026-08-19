const bcrypt = require("bcryptjs");
const User = require("../models/User");

const {
  notifyRestaurantManagers,
} = require("../utils/notificationHelper");

// =========================
// OWNER CHECK
// =========================
const checkOwner = (req, res) => {
  if (
    !req.user ||
    req.user.role !== "owner"
  ) {
    res.status(403).json({
      success: false,
      message:
        "Owner access required",
    });

    return false;
  }

  if (!req.user.restaurantId) {
    res.status(400).json({
      success: false,
      message:
        "Restaurant is not linked to this owner account",
    });

    return false;
  }

  return true;
};

// =========================
// RESTAURANT ACCESS
// OWNER + MANAGER
// =========================
const getRestaurantId = (
  req,
  res
) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message:
        "Authentication required",
    });

    return null;
  }

  const restaurantId =
    req.user.restaurantId;

  if (!restaurantId) {
    res.status(400).json({
      success: false,
      message:
        "Restaurant is not linked to this account",
    });

    return null;
  }

  return restaurantId;
};

// =========================
// GET ALL EMPLOYEES
// OWNER + MANAGER
// =========================
exports.getEmployees = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      ![
        "owner",
        "manager",
      ].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to access staff",
      });
    }

    const restaurantId =
      getRestaurantId(
        req,
        res
      );

    if (!restaurantId) return;

    const employees =
      await User.find({
        restaurantId,

        role: {
          $in: [
            "manager",
            "waiter",
            "kitchen",
          ],
        },
      })
        .select(
          "_id fullName email phone role restaurantId createdAt updatedAt"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error(
      "GET EMPLOYEES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch employees",
    });
  }
};

// =========================
// CREATE EMPLOYEE
// OWNER ONLY
// =========================
exports.createEmployee =
  async (req, res) => {
    try {
      if (!checkOwner(req, res))
        return;

      const {
        fullName,
        email,
        phone,
        password,
        role,
      } = req.body;

      if (
        !fullName?.trim() ||
        !email?.trim() ||
        !password ||
        !role
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Full name, email, password and role are required",
        });
      }

      if (
        ![
          "manager",
          "waiter",
          "kitchen",
        ].includes(role)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid employee role",
        });
      }

      if (
        password.length < 8
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 8 characters",
        });
      }

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );

      const employee =
        await User.create({
          fullName:
            fullName.trim(),

          email: cleanEmail,

          phone:
            phone?.trim() || "",

          password:
            hashedPassword,

          role,

          restaurantId:
            req.user.restaurantId,

          restaurantName:
            req.user
              .restaurantName ||
            "",

          restaurantType:
            req.user
              .restaurantType ||
            "",
        });

      // =================================
      // NOTIFY OWNER + MANAGERS
      // =================================

      await notifyRestaurantManagers({
        restaurantId:
          req.user.restaurantId,

        type: "employee",

        title:
          "New Employee Added",

        message:
          `${employee.fullName} has been added as a ${employee.role}.`,

        referenceId:
          employee._id,
      });

      return res.status(201).json({
        success: true,

        message:
          "Employee account created successfully",

        data: {
          _id:
            employee._id,

          fullName:
            employee.fullName,

          email:
            employee.email,

          phone:
            employee.phone,

          role:
            employee.role,

          restaurantId:
            employee.restaurantId,

          createdAt:
            employee.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "CREATE EMPLOYEE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create employee",
      });
    }
  };

// =========================
// UPDATE EMPLOYEE
// OWNER ONLY
// =========================
exports.updateEmployee =
  async (req, res) => {
    try {
      if (!checkOwner(req, res))
        return;

      const employee =
        await User.findOne({
          _id: req.params.id,

          restaurantId:
            req.user.restaurantId,

          role: {
            $in: [
              "manager",
              "waiter",
              "kitchen",
            ],
          },
        });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message:
            "Employee not found",
        });
      }

      const {
        fullName,
        email,
        phone,
        password,
        role,
      } = req.body;

      // Save old values
      const oldName =
        employee.fullName;

      const oldRole =
        employee.role;

      if (
        fullName !== undefined
      ) {
        employee.fullName =
          fullName.trim();
      }

      if (
        email !== undefined
      ) {
        const cleanEmail =
          email
            .trim()
            .toLowerCase();

        const existingUser =
          await User.findOne({
            email: cleanEmail,

            _id: {
              $ne:
                employee._id,
            },
          });

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message:
              "An account with this email already exists",
          });
        }

        employee.email =
          cleanEmail;
      }

      if (
        phone !== undefined
      ) {
        employee.phone =
          phone.trim();
      }

      if (
        role !== undefined
      ) {
        if (
          ![
            "manager",
            "waiter",
            "kitchen",
          ].includes(role)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid employee role",
          });
        }

        employee.role =
          role;
      }

      if (
        password !== undefined &&
        password !== ""
      ) {
        if (
          password.length < 8
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Password must contain at least 8 characters",
          });
        }

        employee.password =
          await bcrypt.hash(
            password,
            12
          );
      }

      await employee.save();

      // =================================
      // ROLE CHANGE
      // =================================

      if (
        role !== undefined &&
        oldRole !== employee.role
      ) {
        await notifyRestaurantManagers({
          restaurantId:
            req.user
              .restaurantId,

          type: "employee",

          title:
            "Employee Role Updated",

          message:
            `${employee.fullName}'s role changed from ${oldRole} to ${employee.role}.`,

          referenceId:
            employee._id,
        });
      }

      // =================================
      // GENERAL STAFF UPDATE
      // =================================

      else {
        await notifyRestaurantManagers({
          restaurantId:
            req.user
              .restaurantId,

          type: "employee",

          title:
            "Employee Updated",

          message:
            `${oldName} has been updated in the restaurant staff.`,

          referenceId:
            employee._id,
        });
      }

      return res.json({
        success: true,

        message:
          "Employee updated successfully",

        data: {
          _id:
            employee._id,

          fullName:
            employee.fullName,

          email:
            employee.email,

          phone:
            employee.phone,

          role:
            employee.role,

          restaurantId:
            employee.restaurantId,

          updatedAt:
            employee.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "UPDATE EMPLOYEE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update employee",
      });
    }
  };

// =========================
// DELETE EMPLOYEE
// OWNER ONLY
// =========================
exports.deleteEmployee =
  async (req, res) => {
    try {
      if (!checkOwner(req, res))
        return;

      const employee =
        await User.findOneAndDelete({
          _id: req.params.id,

          restaurantId:
            req.user.restaurantId,

          role: {
            $in: [
              "manager",
              "waiter",
              "kitchen",
            ],
          },
        });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message:
            "Employee not found",
        });
      }

      // =================================
      // DELETE NOTIFICATION
      // =================================

      await notifyRestaurantManagers({
        restaurantId:
          req.user.restaurantId,

        type: "employee",

        title:
          "Employee Removed",

        message:
          `${employee.fullName} (${employee.role}) has been removed from the restaurant staff.`,

        referenceId:
          employee._id,
      });

      return res.json({
        success: true,
        message:
          "Employee deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE EMPLOYEE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete employee",
      });
    }
  };