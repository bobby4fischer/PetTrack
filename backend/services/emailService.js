const nodemailer = require('nodemailer');
const User = require('../models/User');
const Task = require('../models/Task');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email transporter verification failed:', error);
        } else {
          console.log('Email service is ready to send messages');
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  // Generate task completion report for a user
  async generateTaskReport(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Get task statistics for today
      const stats = await Task.getTaskStats(userId, startOfDay, endOfDay);
      const taskStats = stats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0
      };

      // Calculate completion ratio
      const completionRatio = taskStats.totalTasks > 0 ? 
        ((taskStats.completedTasks / taskStats.totalTasks) * 100).toFixed(2) : 0;

      // Get today's tasks
      const todaysTasks = await Task.findTodaysTasks(userId);
      
      // Get completed tasks for today
      const completedTasks = todaysTasks.filter(task => task.status === 'completed');
      
      // Get missed/overdue tasks
      const missedTasks = todaysTasks.filter(task => task.isOverdue && task.status !== 'completed');

      // Generate improvement suggestions
      const improvements = this.generateImprovements(taskStats, completionRatio, missedTasks.length);

      return {
        user,
        stats: taskStats,
        completionRatio,
        todaysTasks,
        completedTasks,
        missedTasks,
        improvements,
        reportDate: today
      };
    } catch (error) {
      console.error('Error generating task report:', error);
      throw error;
    }
  }

  // Generate improvement suggestions based on performance
  generateImprovements(stats, completionRatio, missedCount) {
    const improvements = [];

    if (completionRatio < 50) {
      improvements.push('Consider breaking down large tasks into smaller, manageable chunks');
      improvements.push('Set more realistic deadlines for your tasks');
    } else if (completionRatio < 75) {
      improvements.push('You\'re doing well! Try to prioritize high-impact tasks first');
      improvements.push('Consider using time-blocking techniques for better focus');
    } else {
      improvements.push('Excellent work! You\'re maintaining a great completion rate');
      improvements.push('Consider taking on more challenging tasks to grow further');
    }

    if (missedCount > 0) {
      improvements.push('Review your task scheduling to avoid overdue items');
      improvements.push('Set reminders for important deadlines');
    }

    if (stats.inProgressTasks > stats.completedTasks) {
      improvements.push('Focus on completing existing tasks before starting new ones');
    }

    return improvements;
  }

  // Generate HTML email template
  generateEmailHTML(reportData) {
    const {
      user,
      stats,
      completionRatio,
      completedTasks,
      missedTasks,
      improvements,
      reportDate
    } = reportData;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Daily Productivity Report</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
            .stat-label { color: #666; font-size: 0.9em; }
            .completion-ratio { font-size: 3em; font-weight: bold; color: ${completionRatio >= 75 ? '#4CAF50' : completionRatio >= 50 ? '#FF9800' : '#F44336'}; text-align: center; margin: 20px 0; }
            .section { margin: 25px 0; }
            .section h3 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
            .task-list { background: white; border-radius: 8px; padding: 15px; }
            .task-item { padding: 10px; border-left: 4px solid #667eea; margin: 10px 0; background: #f8f9fa; }
            .improvements { background: #e8f5e8; border-left: 4px solid #4CAF50; padding: 15px; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📊 Your Daily Productivity Report</h1>
            <p>Hello ${user.getFullName()}!</p>
            <p>${reportDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="content">
            <div class="completion-ratio">
                ${completionRatio}%
                <div style="font-size: 0.3em; color: #666;">COMPLETION RATE</div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalTasks}</div>
                    <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.completedTasks}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.pendingTasks}</div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.overdueTasks}</div>
                    <div class="stat-label">Overdue</div>
                </div>
            </div>

            ${completedTasks.length > 0 ? `
            <div class="section">
                <h3>✅ Tasks Completed Today</h3>
                <div class="task-list">
                    ${completedTasks.map(task => `
                        <div class="task-item">
                            <strong>${task.title}</strong>
                            ${task.description ? `<br><small>${task.description}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${missedTasks.length > 0 ? `
            <div class="section">
                <h3>⚠️ Missed Tasks</h3>
                <div class="task-list">
                    ${missedTasks.map(task => `
                        <div class="task-item">
                            <strong>${task.title}</strong>
                            <br><small>Due: ${task.dueDate.toLocaleDateString()}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h3>💡 Improvement Suggestions</h3>
                <div class="improvements">
                    ${improvements.map(improvement => `<p>• ${improvement}</p>`).join('')}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Keep up the great work! 🚀</p>
            <p><small>This report was generated automatically by PetTalk Productivity App</small></p>
        </div>
    </body>
    </html>
    `;
  }

  // Send productivity report email
  async sendProductivityReport(userId) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      // Generate report data
      const reportData = await this.generateTaskReport(userId);
      
      // Generate email HTML
      const htmlContent = this.generateEmailHTML(reportData);

      // Email options
      const mailOptions = {
        from: `"PetTalk Productivity" <${process.env.EMAIL_FROM}>`,
        to: reportData.user.email,
        subject: `📊 Your Daily Productivity Report - ${reportData.completionRatio}% Completion Rate`,
        html: htmlContent,
        text: `
Daily Productivity Report for ${reportData.user.getFullName()}

Completion Rate: ${reportData.completionRatio}%
Total Tasks: ${reportData.stats.totalTasks}
Completed: ${reportData.stats.completedTasks}
Pending: ${reportData.stats.pendingTasks}
Overdue: ${reportData.stats.overdueTasks}

Improvements:
${reportData.improvements.map(imp => `• ${imp}`).join('\n')}

Keep up the great work!
        `
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);
      
      // Update user's last email sent timestamp
      await User.findByIdAndUpdate(userId, { lastEmailSent: new Date() });

      console.log(`Productivity report sent to ${reportData.user.email}:`, result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending productivity report:', error);
      throw error;
    }
  }

  // Send reports to all eligible users
  async sendReportsToAllUsers() {
    try {
      const users = await User.findActiveUsers();
      const results = [];

      for (const user of users) {
        // Check if user has email reports enabled
        if (!user.emailPreferences.enableReports) {
          continue;
        }

        // Check if enough time has passed since last email
        const now = new Date();
        const lastEmailSent = user.lastEmailSent;
        
        if (lastEmailSent) {
          const hoursSinceLastEmail = (now - lastEmailSent) / (1000 * 60 * 60);
          const requiredHours = user.emailPreferences.reportFrequency === '6hours' ? 6 :
                               user.emailPreferences.reportFrequency === '12hours' ? 12 : 24;
          
          if (hoursSinceLastEmail < requiredHours) {
            continue;
          }
        }

        try {
          const result = await this.sendProductivityReport(user._id);
          results.push({ userId: user._id, email: user.email, success: true, messageId: result.messageId });
        } catch (error) {
          console.error(`Failed to send report to ${user.email}:`, error);
          results.push({ userId: user._id, email: user.email, success: false, error: error.message });
        }
      }

      console.log(`Sent ${results.filter(r => r.success).length} reports out of ${results.length} attempts`);
      return results;
    } catch (error) {
      console.error('Error sending reports to all users:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();