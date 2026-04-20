import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';
import { Job } from '@/models/Job';

export async function GET() {
  try {
    await connectDB();

    // 1. Total Users (Customers + Technicians)
    const totalUsers = await Customer.countDocuments();

    // 2. Total Orders (All Jobs)
    const totalOrders = await Job.countDocuments();

    // 3. Total Revenue (Sum of quotedPrice for completed/billed/closed jobs)
    const revenueStats = await Job.aggregate([
      {
        $match: {
          status: { $in: ['signed_off', 'completed', 'billed', 'closed'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$quotedPrice' }
        }
      }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    // 4. Pending Quotes (RFQ or Quote Sent)
    const pendingQuotes = await Job.countDocuments({
      status: { $in: ['rfq', 'quote_sent'] }
    });

    // 5. Calculate trends (comparing to last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const userGrowth = totalUsers > 0 ? (recentUsers / totalUsers) * 100 : 0;

    return NextResponse.json({
      stats: [
        { 
          label: 'Total Orders', 
          value: totalOrders.toString(), 
          trend: `Total jobs tracked`,
          type: 'orders'
        },
        { 
          label: 'Active Users', 
          value: totalUsers.toString(), 
          trend: `${userGrowth.toFixed(1)}% new this month`,
          type: 'users'
        },
        { 
          label: 'Revenue', 
          value: `$${totalRevenue.toLocaleString()}`, 
          trend: 'Signed/Closed value',
          type: 'revenue'
        },
        { 
          label: 'Pending Quotes', 
          value: pendingQuotes.toString(), 
          trend: 'Awaiting conversion',
          type: 'quotes'
        },
      ]
    });
  } catch (error) {
    console.error('[DashboardStats] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
