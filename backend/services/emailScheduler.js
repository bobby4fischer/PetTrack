const cron = require('node-cron');
const emailService = require('./emailService');

class EmailScheduler {
  constructor() {
    this.scheduledTasks = [];
  }

  // Start the email scheduler
  startScheduler() {
    try {
      // Schedule email reports every 6 hours (at 00:00, 06:00, 12:00, 18:00)
      const task = cron.schedule('0 */6 * * *', async () => {
        console.log('Running scheduled email reports...');
        try {
          const results = await emailService.sendReportsToAllUsers();
          console.log('Scheduled email reports completed:', {
            timestamp: new Date().toISOString(),
            totalAttempts: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
          });
        } catch (error) {
          console.error('Error in scheduled email reports:', error);
        }
      }, {
        scheduled: true,
        timezone: "UTC"
      });

      this.scheduledTasks.push({
        name: 'productivity-reports',
        task: task,
        schedule: '0 */6 * * *',
        description: 'Send productivity reports every 6 hours'
      });

      console.log('Email scheduler started successfully');
      console.log('Productivity reports will be sent every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)');
      
      // Optional: Schedule a daily summary at midnight
      const dailySummaryTask = cron.schedule('0 0 * * *', async () => {
        console.log('Running daily summary...');
        try {
          // This could be extended to send daily summaries or perform cleanup
          console.log('Daily summary completed at:', new Date().toISOString());
        } catch (error) {
          console.error('Error in daily summary:', error);
        }
      }, {
        scheduled: true,
        timezone: "UTC"
      });

      this.scheduledTasks.push({
        name: 'daily-summary',
        task: dailySummaryTask,
        schedule: '0 0 * * *',
        description: 'Daily summary and cleanup at midnight'
      });

    } catch (error) {
      console.error('Failed to start email scheduler:', error);
    }
  }

  // Stop the email scheduler
  stopScheduler() {
    try {
      this.scheduledTasks.forEach(scheduledTask => {
        scheduledTask.task.stop();
        console.log(`Stopped scheduled task: ${scheduledTask.name}`);
      });
      this.scheduledTasks = [];
      console.log('Email scheduler stopped successfully');
    } catch (error) {
      console.error('Error stopping email scheduler:', error);
    }
  }

  // Get scheduler status
  getSchedulerStatus() {
    return {
      isRunning: this.scheduledTasks.length > 0,
      activeTasks: this.scheduledTasks.map(task => ({
        name: task.name,
        schedule: task.schedule,
        description: task.description,
        isRunning: task.task.running
      })),
      nextRun: this.getNextRunTime()
    };
  }

  // Get next run time for the main productivity report task
  getNextRunTime() {
    const now = new Date();
    const hours = [0, 6, 12, 18];
    
    for (const hour of hours) {
      const nextRun = new Date(now);
      nextRun.setHours(hour, 0, 0, 0);
      
      if (nextRun > now) {
        return nextRun;
      }
    }
    
    // If no time today, return first time tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  // Manually trigger email reports (for testing)
  async triggerReportsManually() {
    try {
      console.log('Manually triggering email reports...');
      const results = await emailService.sendReportsToAllUsers();
      console.log('Manual email reports completed:', {
        timestamp: new Date().toISOString(),
        totalAttempts: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });
      return results;
    } catch (error) {
      console.error('Error in manual email reports:', error);
      throw error;
    }
  }

  // Send report to specific user (for testing)
  async sendReportToUser(userId) {
    try {
      console.log(`Sending report to user: ${userId}`);
      const result = await emailService.sendProductivityReport(userId);
      console.log('Report sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending report to user:', error);
      throw error;
    }
  }
}

module.exports = new EmailScheduler();