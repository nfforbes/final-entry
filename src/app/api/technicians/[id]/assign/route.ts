import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Quote } from '@/models/Quote';
import { Technician } from '@/models/Technician';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const { quoteId } = await req.json();

    const [technician, quote] = await Promise.all([
      Technician.findById(id),
      Quote.findById(quoteId),
    ]);

    if (!technician || !quote) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Assign technician to quote
    quote.technicianId = technician._id;
    quote.status = 'contacted';

    // Add quote to technician's active list
    if (!technician.activeQuotes.includes(quoteId)) {
      technician.activeQuotes.push(quoteId);
    }

    await Promise.all([quote.save(), technician.save()]);

    return NextResponse.json({ quote, technician });
  } catch {
    return NextResponse.json({ error: 'Assignment failed' }, { status: 500 });
  }
}
