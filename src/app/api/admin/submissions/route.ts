import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Intake Submissions';

export const dynamic = 'force-dynamic';

// Fields to fetch from Airtable (subset for list view)
const LIST_FIELDS = [
  'Session ID',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'State',
  'Type',
  'EONPRO Sync Status',
  'Date of Birth',
  'Current Weight (lbs)',
  'Medication Preference',
];

export async function GET(request: NextRequest) {
  // Verify authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check Airtable configuration
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    return NextResponse.json(
      { error: 'Airtable not configured', submissions: [] },
      { status: 200 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const offset = searchParams.get('offset') || '';

    // Build filter formula
    const filters: string[] = [];
    
    if (search) {
      // Search in name, email, or phone
      filters.push(
        `OR(FIND(LOWER("${search}"), LOWER({First Name})), FIND(LOWER("${search}"), LOWER({Last Name})), FIND(LOWER("${search}"), LOWER({Email})), FIND("${search}", {Phone}))`
      );
    }
    
    if (status === 'synced') {
      filters.push(`{EONPRO Sync Status} = 'Synced'`);
    } else if (status === 'pending') {
      filters.push(`{EONPRO Sync Status} = 'Pending'`);
    } else if (status === 'failed') {
      filters.push(`{EONPRO Sync Status} = 'Failed'`);
    }

    const filterFormula = filters.length > 0 
      ? `AND(${filters.join(', ')})`
      : '';

    // Build URL with query params
    const params = new URLSearchParams();
    params.set('pageSize', '20');
    params.set('sort[0][field]', 'Session ID');
    params.set('sort[0][direction]', 'desc');
    
    LIST_FIELDS.forEach((field, index) => {
      params.set(`fields[${index}]`, field);
    });
    
    if (filterFormula) {
      params.set('filterByFormula', filterFormula);
    }
    
    if (offset) {
      params.set('offset', offset);
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch from Airtable', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform records for frontend
    const submissions = data.records.map((record: { id: string; fields: Record<string, unknown>; createdTime: string }) => ({
      id: record.id,
      sessionId: record.fields['Session ID'] || '',
      firstName: record.fields['First Name'] || '',
      lastName: record.fields['Last Name'] || '',
      email: record.fields['Email'] || '',
      phone: record.fields['Phone'] || '',
      state: record.fields['State'] || '',
      type: record.fields['Type'] || '',
      syncStatus: record.fields['EONPRO Sync Status'] || 'Pending',
      dob: record.fields['Date of Birth'] || '',
      weight: record.fields['Current Weight (lbs)'] || '',
      medication: record.fields['Medication Preference'] || '',
      createdAt: record.createdTime,
    }));

    return NextResponse.json({
      submissions,
      offset: data.offset || null,
      hasMore: !!data.offset,
      total: submissions.length,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
