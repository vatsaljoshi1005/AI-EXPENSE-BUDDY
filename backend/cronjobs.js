const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const { sendEmail } = require('./utils/mailer');

if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI);
}

// --- 1. Missing transactions reminder (daily check for yesterday) ---
cron.schedule('0 9 * * *', async () => { // every day 9 AM
  const yesterdayStart = new Date();
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);

  const yesterdayEnd = new Date();
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const users = await User.find({});
  for (const user of users) {
    const hasTransactionsYesterday = await Transaction.exists({
      userId: user._id,
      paymentDate: { $gte: yesterdayStart, $lte: yesterdayEnd }
    });

    if (!hasTransactionsYesterday) {
      sendEmail(
        user.email,
        "Friendly Reminder: Time to log your expenses! 💰",
        `<p>Hi ${user.name},</p><p>We noticed you haven't added any transactions yesterday. Just a friendly reminder to not forget to add your expenses! Keeping a daily habit of logging is the best way to stay on top of your finances.</p><p>- AI Expense Buddy</p>`
      );
    }
  }
});

// --- 2. Weekly summary (every Monday 8 AM) ---
cron.schedule('0 8 * * 1', async () => { // every Monday
  const today = new Date();
  const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

  const users = await User.find({});
  for (const user of users) {
    const transactions = await Transaction.find({
      userId: user._id,
      paymentDate: { $gte: lastWeek, $lte: today }
    });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((a,b)=>a+b.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a,b)=>a+b.amount, 0);

    sendEmail(
      user.email,
      "Your Weekly Expense Summary",
      `<p>Hi ${user.name},</p>
       <p>Here's your weekly summary:</p>
       <ul>
         <li>Total Income: ₹${totalIncome}</li>
         <li>Total Expenses: ₹${totalExpense}</li>
         <li>Balance: ₹${totalIncome - totalExpense}</li>
       </ul>
       <p>Stay on top of your finances!</p>`
    );
  }
});