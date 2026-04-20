import mongoose from 'mongoose';
import { Job } from '../models/Job';
import { connectDB } from '../lib/mongodb';

async function test() {
  try {
    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected.');
    
    console.log('Fetching one job and populating...');
    const job = await Job.findOne({}).populate('customerId serviceId technicianId');
    console.log('Success:', !!job);
    if (job) {
       console.log('Job found with populated fields.');
    } else {
       console.log('No jobs found to test with.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Test Failed:', error);
    process.exit(1);
  }
}

test();
