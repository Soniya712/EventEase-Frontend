"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function PaymentPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [error, setError] = useState('');
  const initiated = useRef(false);

  useEffect(() => {
    if (!id || initiated.current) return;
    initiated.current = true;

    const startPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/khalti-payment/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ booking_id: id }),
        });

        const data = await response.json();
        if (!response.ok || !data.payment_url) {
          throw new Error(data.error || 'Failed to initiate payment');
        }

        // Redirect the user to the Khalti payment page
        window.location.href = data.payment_url;
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Payment initiation failed');
      }
    };

    startPayment();
  }, [id, router]);

  if (!id) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  return <div className="p-10 text-center">Redirecting to Khalti payment gateway...</div>;
}