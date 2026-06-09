import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { Job } from '@/models/Job';

export async function computeAdminDashboardStats(): Promise<{
  stats: Array<{
    label: string;
    value: string;
    trend: string;
    type: string;
  }>;
}> {
  await connectDB();

  const totalUsers = await Customer.countDocuments();
  const totalOrders = await Job.countDocuments();

  const revenueStats = await Job.aggregate([
    {
      $match: {
        status: { $in: ['signed_off', 'completed', 'billed', 'closed'] },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$quotedPrice' },
      },
    },
  ]);
  const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

  const pendingQuotes = await Job.countDocuments({
    status: { $in: ['rfq', 'quote_sent'] },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUsers = await Customer.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const userGrowth = totalUsers > 0 ? (recentUsers / totalUsers) * 100 : 0;

  return {
    stats: [
      {
        label: 'Total Orders',
        value: totalOrders.toString(),
        trend: `Total jobs tracked`,
        type: 'orders',
      },
      {
        label: 'Active Users',
        value: totalUsers.toString(),
        trend: `${userGrowth.toFixed(1)}% new this month`,
        type: 'users',
      },
      {
        label: 'Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        trend: 'Signed/Closed value',
        type: 'revenue',
      },
      {
        label: 'Pending Quotes',
        value: pendingQuotes.toString(),
        trend: 'Awaiting conversion',
        type: 'quotes',
      },
    ],
  };
}
