const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const { auth: authMiddleware } = require("../middleware/auth");

// Get user notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query;
    const userId = req.user._id;

    const query = { recipientId: userId };
    
    if (unreadOnly === "true") {
      query.isRead = false;
    }
    
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('senderId', 'name email')
      .sort({ created: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipientId: userId, 
      isRead: false 
    });

    // Log the view
    await ActivityLog.logActivity({
      userId,
      action: "view",
      resourceType: "notification",
      description: `Viewed notifications page ${page}`,
      metadata: { page, limit, unreadOnly, type }
    });

    res.json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        unreadCount
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Mark notification as read
router.patch("/:notificationId/read", authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        recipientId: userId 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Log the action
    await ActivityLog.logActivity({
      userId,
      action: "update",
      resourceType: "notification",
      resourceId: notification._id,
      description: `Marked notification as read: ${notification.title}`
    });

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
});

// Mark all notifications as read
router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { 
        recipientId: userId, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    // Log the action
    await ActivityLog.logActivity({
      userId,
      action: "update",
      resourceType: "notification",
      description: `Marked ${result.modifiedCount} notifications as read`
    });

    res.json({ 
      message: "All notifications marked as read",
      count: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error updating notifications" });
  }
});

// Delete notification
router.delete("/:notificationId", authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Log the action
    await ActivityLog.logActivity({
      userId,
      action: "delete",
      resourceType: "notification",
      resourceId: notification._id,
      description: `Deleted notification: ${notification.title}`
    });

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
});

// Create notification (for faculty/admin)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { 
      recipientIds, 
      type, 
      title, 
      message, 
      priority = "medium",
      actions = [],
      metadata = {}
    } = req.body;

    // Check permissions (only faculty and admin can create notifications)
    if (req.user.role === "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate recipient(s)
    const recipients = Array.isArray(recipientIds) ? recipientIds : [recipientIds];
    const validRecipients = await User.find({ 
      _id: { $in: recipients } 
    });

    if (validRecipients.length === 0) {
      return res.status(400).json({ message: "No valid recipients found" });
    }

    // Create notifications for each recipient
    const notifications = await Promise.all(
      validRecipients.map(recipient =>
        Notification.create({
          recipientId: recipient._id,
          senderId: req.user._id,
          type,
          title,
          message,
          priority,
          actions,
          metadata,
          deliveryMethods: [{
            type: "in_app",
            sent: true,
            sentAt: new Date(),
            status: "delivered"
          }]
        })
      )
    );

    // Log the action
    await ActivityLog.logActivity({
      userId: req.user._id,
      action: "create",
      resourceType: "notification",
      description: `Created "${title}" notification for ${validRecipients.length} recipients`,
      metadata: { type, priority, recipientCount: validRecipients.length }
    });

    res.status(201).json({ 
      message: "Notifications created successfully",
      count: notifications.length 
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Error creating notification" });
  }
});

// Get notification statistics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Notification.aggregate([
      { $match: { recipientId: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalNotifications: { $sum: "$total" },
          totalUnread: { $sum: "$unread" },
          typeBreakdown: {
            $push: {
              type: "$_id",
              total: "$total",
              unread: "$unread"
            }
          }
        }
      }
    ]);

    const priorityStats = await Notification.aggregate([
      { $match: { recipientId: userId } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }
        }
      }
    ]);

    // Log the view
    await ActivityLog.logActivity({
      userId,
      action: "view",
      resourceType: "notification",
      description: "Viewed notification statistics"
    });

    res.json({
      total: stats[0]?.totalNotifications || 0,
      unread: stats[0]?.totalUnread || 0,
      typeBreakdown: stats[0]?.typeBreakdown || [],
      priorityBreakdown: priorityStats
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
});

// Send batch notifications (for announcements, etc.)
router.post("/batch", authMiddleware, async (req, res) => {
  try {
    const { 
      recipientType, // "all", "students", "faculty", "department", "semester"
      department,
      semester,
      type,
      title,
      message,
      priority = "medium"
    } = req.body;

    // Check permissions (only admin can send batch notifications)
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Build recipient query
    let recipientQuery = {};
    
    switch (recipientType) {
      case "students":
        recipientQuery.role = "student";
        break;
      case "faculty":
        recipientQuery.role = "faculty";
        break;
      case "department":
        recipientQuery.department = department;
        break;
      case "semester":
        recipientQuery.semester = semester;
        break;
      case "all":
      default:
        // All users
        break;
    }

    const recipients = await User.find(recipientQuery);
    
    if (recipients.length === 0) {
      return res.status(400).json({ message: "No recipients found" });
    }

    const batchId = `batch_${Date.now()}`;

    // Create batch notifications
    const notifications = await Promise.all(
      recipients.map(recipient =>
        Notification.create({
          recipientId: recipient._id,
          senderId: req.user._id,
          type,
          title,
          message,
          priority,
          batchId,
          deliveryMethods: [{
            type: "in_app",
            sent: true,
            sentAt: new Date(),
            status: "delivered"
          }]
        })
      )
    );

    // Log the action
    await ActivityLog.logActivity({
      userId: req.user._id,
      action: "create",
      resourceType: "notification",
      description: `Sent batch notification "${title}" to ${recipients.length} users`,
      metadata: { 
        recipientType, 
        department, 
        semester, 
        type, 
        priority,
        recipientCount: recipients.length,
        batchId
      }
    });

    res.status(201).json({ 
      message: "Batch notifications sent successfully",
      count: notifications.length,
      batchId
    });
  } catch (error) {
    console.error("Error sending batch notifications:", error);
    res.status(500).json({ message: "Error sending batch notifications" });
  }
});

// Get unread notification count
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Error fetching unread count" });
  }
});

module.exports = router;
