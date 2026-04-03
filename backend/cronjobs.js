const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const { sendEmail } = require('./utils/mailer');

if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI);
}

// --- 1. Inactive users (2 days) ---
cron.schedule('0 9 * * *', async () => { // every day 9 AM
  const twoDaysAgo = new Date(Date.now() - 2*24*60*60*1000);
  const inactiveUsers = await User.find({ lastActive: { $lt: twoDaysAgo } });

  inactiveUsers.forEach(user => {
    sendEmail(
      user.email,
      "We Miss You at AI Expense Buddy!",
      `<p>Hi ${user.name},<br><br>It looks like you haven’t logged in for 2 days. Check your expenses and stay on track!</p>`
    );
  });
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