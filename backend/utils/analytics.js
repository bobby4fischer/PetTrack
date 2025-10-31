const Task = require('../models/Task');

class Analytics {
  // Calculate detailed task completion statistics
  static async getDetailedTaskStats(userId, startDate, endDate) {
    try {
      const pipeline = [
        {
          $match: {
            userId: userId,
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
            pendingTasks: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
              }
            },
            inProgressTasks: {
              $sum: {
                $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0]
              }
            },
            cancelledTasks: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
              }
            },
            overdueTasks: {
              $sum: {
                $cond: ['$isOverdue', 1, 0]
              }
            },
            highPriorityTasks: {
              $sum: {
                $cond: [{ $in: ['$priority', ['high', 'urgent']] }, 1, 0]
              }
            },
            completedHighPriorityTasks: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'completed'] },
                      { $in: ['$priority', ['high', 'urgent']] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            totalEstimatedTime: {
              $sum: {
                $cond: [
                  { $ne: ['$estimatedDuration', null] },
                  '$estimatedDuration',
                  0
                ]
              }
            },
            totalActualTime: {
              $sum: {
                $cond: [
                  { $ne: ['$actualDuration', null] },
                  '$actualDuration',
                  0
                ]
              }
            }
          }
        }
      ];

      const result = await Task.aggregate(pipeline);
      const stats = result[0] || {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        cancelledTasks: 0,
        overdueTasks: 0,
        highPriorityTasks: 0,
        completedHighPriorityTasks: 0,
        totalEstimatedTime: 0,
        totalActualTime: 0
      };

      // Calculate additional metrics
      stats.completionRate = stats.totalTasks > 0 ? 
        ((stats.completedTasks / stats.totalTasks) * 100).toFixed(2) : 0;
      
      stats.highPriorityCompletionRate = stats.highPriorityTasks > 0 ? 
        ((stats.completedHighPriorityTasks / stats.highPriorityTasks) * 100).toFixed(2) : 0;
      
      stats.overdueRate = stats.totalTasks > 0 ? 
        ((stats.overdueTasks / stats.totalTasks) * 100).toFixed(2) : 0;
      
      stats.timeAccuracy = stats.totalEstimatedTime > 0 ? 
        ((stats.totalActualTime / stats.totalEstimatedTime) * 100).toFixed(2) : 0;

      return stats;
    } catch (error) {
      console.error('Error calculating detailed task stats:', error);
      throw error;
    }
  }

  // Get task completion trends over time
  static async getCompletionTrends(userId, days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const pipeline = [
        {
          $match: {
            userId: userId,
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            }
          }
        },
        {
          $addFields: {
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            },
            completionRate: {
              $cond: [
                { $gt: ['$totalTasks', 0] },
                { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                0
              ]
            }
          }
        },
        {
          $sort: { date: 1 }
        }
      ];

      const trends = await Task.aggregate(pipeline);
      return trends;
    } catch (error) {
      console.error('Error calculating completion trends:', error);
      throw error;
    }
  }

  // Get productivity insights and recommendations
  static generateProductivityInsights(stats, trends) {
    const insights = [];
    const recommendations = [];

    // Completion rate insights
    if (stats.completionRate >= 80) {
      insights.push('Excellent completion rate! You\'re very productive.');
      recommendations.push('Consider taking on more challenging projects to grow further.');
    } else if (stats.completionRate >= 60) {
      insights.push('Good completion rate with room for improvement.');
      recommendations.push('Try breaking down large tasks into smaller, manageable chunks.');
    } else if (stats.completionRate >= 40) {
      insights.push('Your completion rate suggests you might be overcommitting.');
      recommendations.push('Focus on completing fewer tasks with higher quality.');
    } else {
      insights.push('Low completion rate indicates potential planning issues.');
      recommendations.push('Review your task planning and set more realistic deadlines.');
    }

    // Overdue tasks insights
    if (stats.overdueRate > 20) {
      insights.push('High number of overdue tasks detected.');
      recommendations.push('Implement better time management and deadline tracking.');
    } else if (stats.overdueRate > 10) {
      insights.push('Some tasks are becoming overdue.');
      recommendations.push('Set up reminders and review your task priorities.');
    }

    // High priority task insights
    if (stats.highPriorityCompletionRate < 70 && stats.highPriorityTasks > 0) {
      insights.push('Important tasks are not being completed efficiently.');
      recommendations.push('Prioritize high-importance tasks at the beginning of your day.');
    }

    // Time estimation insights
    if (stats.timeAccuracy > 120) {
      insights.push('You tend to underestimate task duration.');
      recommendations.push('Add buffer time to your task estimates.');
    } else if (stats.timeAccuracy < 80) {
      insights.push('You tend to overestimate task duration.');
      recommendations.push('You might be able to take on more tasks.');
    }

    // Trend analysis
    if (trends.length >= 3) {
      const recentTrends = trends.slice(-3);
      const avgRecentCompletion = recentTrends.reduce((sum, day) => sum + day.completionRate, 0) / recentTrends.length;
      
      if (avgRecentCompletion > 75) {
        insights.push('Your recent productivity has been consistently high.');
      } else if (avgRecentCompletion < 50) {
        insights.push('Your recent productivity has been below average.');
        recommendations.push('Consider reviewing your workload and stress levels.');
      }
    }

    return { insights, recommendations };
  }

  // Get category-wise task distribution
  static async getCategoryDistribution(userId, startDate, endDate) {
    try {
      const pipeline = [
        {
          $match: {
            userId: userId,
            createdAt: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: '$category',
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            }
          }
        },
        {
          $addFields: {
            completionRate: {
              $cond: [
                { $gt: ['$totalTasks', 0] },
                { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                0
              ]
            }
          }
        },
        {
          $sort: { totalTasks: -1 }
        }
      ];

      const distribution = await Task.aggregate(pipeline);
      return distribution;
    } catch (error) {
      console.error('Error calculating category distribution:', error);
      throw error;
    }
  }

  // Calculate weekly performance summary
  static async getWeeklyPerformance(userId) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const stats = await this.getDetailedTaskStats(userId, startDate, endDate);
      const trends = await this.getCompletionTrends(userId, 7);
      const categoryDistribution = await this.getCategoryDistribution(userId, startDate, endDate);
      const insights = this.generateProductivityInsights(stats, trends);

      return {
        period: {
          startDate,
          endDate
        },
        stats,
        trends,
        categoryDistribution,
        insights
      };
    } catch (error) {
      console.error('Error calculating weekly performance:', error);
      throw error;
    }
  }
}

module.exports = Analytics;