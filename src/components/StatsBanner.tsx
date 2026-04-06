"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  total_venues: number;
  total_cities: number;
  total_capacity: number;
  avg_price: number;
}

export default function StatsBanner() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.getStatsSummary().then(setStats).catch(console.error);
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-pink-50 py-8 border-y border-pink-100">
      <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-3xl font-bold text-pink-600">{stats.total_venues}+</div>
          <div className="text-gray-600">Wedding Halls</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-pink-600">{stats.total_cities}+</div>
          <div className="text-gray-600">Cities</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-pink-600">{Math.floor(stats.total_capacity / 1000)}k+</div>
          <div className="text-gray-600">Guest Capacity</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-pink-600">₹{Math.floor(stats.avg_price / 1000)}k</div>
          <div className="text-gray-600">Avg Price/Plate</div>
        </div>
      </div>
    </div>
  );
}