"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();

    useEffect(() => {
      router.push('/login');
      // This code runs only on the client side
      const token = localStorage.getItem('token');
      if (!token) {
          // Redirect to login if no token is found
          router.push('/login');
      }
    }, [router]);

    return <div className="w-full"></div>;
}

