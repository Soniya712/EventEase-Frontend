import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pidx = searchParams.get('pidx');
  // Forward to Laravel
  const response = await fetch(`http://127.0.0.1:8000/api/khalti-payment/verify?${searchParams.toString()}`);
  // Redirect to frontend with result
  if (response.status === 302) {
    const location = response.headers.get('location');
    if (location) return NextResponse.redirect(location);
  }
  return NextResponse.redirect('http://localhost:3000/my-bookings?payment=failed');
}