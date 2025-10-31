const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters'],
    default: 'general'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: [1, 'Estimated duration must be at least 1 minute'],
    max: [1440, 'Estimated duration cannot exceed 24 hours (1440 minutes)']
  },
  actualDuration: {
    type: Number, // in minutes
    min: [0, 'Actual duration cannot be negative']
  },
  completedAt: {
    type: Date,
    default: null
  },
  isOverdue: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Check if task is overdue
  if (this.dueDate < new Date() && this.status !== 'completed') {
    this.isOverdue = true;
  } else {
    this.isOverdue = false;
  }
  
  next();
});

// Instance method to check if task is due today
taskSchema.methods.isDueToday = function() {
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  return today.toDateString() === dueDate.toDateString();
};

// Instance method to get days until due
taskSchema.methods.getDaysUntilDue = function() {
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Static method to find tasks by user and date range
taskSchema.statics.findTasksByUserAndDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId: userId,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ createdAt: -1 });
};

// Static method to find today's tasks for a user
taskSchema.statics.findTodaysTasks = function(userId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    userId: userId,
    dueDate: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  }).sort({ priority: -1, dueDate: 1 });
};

// Static method to get task statistics for a user
taskSchema.statics.getTaskStats = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        },
        overdueTasks: {
          $sum: {
            $cond: ['$isOverdue', 1, 0]
          }
        },
        pendingTasks: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
          }
        },
        inProgressTasks: {
          $sum: {
            $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Index for better query performance
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);