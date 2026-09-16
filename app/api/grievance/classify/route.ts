import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: true,
      message: 'Grievance classification endpoint stub',
      data: {
        status: 'stub_active',
      },
    },
    { status: 200 }
  );
}
