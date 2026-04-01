"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Users, 
  DollarSign,
  Clock,
  Filter,
  Download,
  Sun,
  Cloud,
  CloudRain,
  Info,
  BookOpen
} from "lucide-react";

interface Booking {
  id: number;
  event_date: string;
  guest_count: number;
  event_type: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests: string;
  created_at: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  venue: {
    id: number;
    name: string;
    city: string;
    capacity: number;
  };
}

// Availability status for calendar
interface DayAvailability {
  date: Date;
  dateStr: string;
  day: number;
  bookings: Booking[];
  isAvailable: boolean;
  availableSlots: number;
  totalGuests: number;
  maxCapacity: number;
  status: 'available' | 'limited' | 'booked' | 'blocked';
  revenue: number;
  weather?: 'sunny' | 'cloudy' | 'rainy';
}

export default function OwnerCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVenue, setSelectedVenue] = useState<number | 'all'>('all');
  const [viewType, setViewType] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<DayAvailability | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    availableDays: 0,
    bookedDays: 0,
    limitedDays: 0,
    occupancyRate: 0
  });

  useEffect(() => {
    setUserName(localStorage.getItem("user_name") || 'Owner');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch bookings
      const bookingsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookingsRes.data);
      
      // Fetch venues for filter
      const venuesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/owner/venues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVenues(venuesRes.data);
      
      calculateStats(bookingsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingData: Booking[]) => {
    const confirmed = bookingData.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const revenue = confirmed.reduce((sum, b) => sum + Number(b.total_amount), 0);
    
    // Get unique dates in current month view
    const daysInMonth = getDaysInMonth(currentDate);
    const currentMonthDays = daysInMonth.filter(d => d.getMonth() === currentDate.getMonth());
    
    let bookedCount = 0;
    let limitedCount = 0;
    let availableCount = 0;

    currentMonthDays.forEach(date => {
      const dayData = getDayAvailability(date);
      if (dayData.status === 'booked') bookedCount++;
      else if (dayData.status === 'limited') limitedCount++;
      else if (dayData.status === 'available') availableCount++;
    });
    
    const occupancyRate = (bookedCount / currentMonthDays.length) * 100;

    setStats({
      totalBookings: confirmed.length,
      totalRevenue: revenue,
      availableDays: availableCount,
      bookedDays: bookedCount,
      limitedDays: limitedCount,
      occupancyRate: Math.round(occupancyRate)
    });
  };

  // Calendar Generation Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Add padding days from previous month
    const padding = firstDay.getDay(); // 0 = Sunday
    for (let i = padding; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    
    // Add all days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add padding days from next month to complete 6 rows
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Start from Sunday
    
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return week;
  };

  const getDayAvailability = (date: Date): DayAvailability => {
    const dateStr = date.toDateString();
    const dayBookings = bookings.filter(b => {
      const bookingDate = new Date(b.event_date).toDateString();
      const venueMatch = selectedVenue === 'all' || b.venue.id === selectedVenue;
      return bookingDate === dateStr && venueMatch;
    });

    const confirmedBookings = dayBookings.filter(b => 
      b.status === 'confirmed' || b.status === 'completed'
    );
    
    const totalGuests = confirmedBookings.reduce((sum, b) => sum + b.guest_count, 0);
    const revenue = confirmedBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
    
    // Get venue capacity (use max from selected venue or default)
    let maxCapacity = 500;
    if (selectedVenue !== 'all') {
      const venue = venues.find(v => v.id === selectedVenue);
      maxCapacity = venue?.capacity || 500;
    } else {
      // Use average or max capacity across venues
      maxCapacity = Math.max(...venues.map(v => v.capacity || 500), 500);
    }
    
    let status: 'available' | 'limited' | 'booked' | 'blocked' = 'available';
    
    if (confirmedBookings.length > 0) {
      const occupancyRate = (totalGuests / maxCapacity) * 100;
      
      if (occupancyRate >= 100) {
        status = 'booked'; // RED for fully booked
      } else if (occupancyRate >= 70) {
        status = 'limited'; // YELLOW for limited availability
      } else {
        status = 'available'; // GREEN for available
      }
    }

    // Mock weather data (you can replace with actual weather API)
    const weatherOptions: ('sunny' | 'cloudy' | 'rainy')[] = ['sunny', 'cloudy', 'rainy'];
    const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

    return {
      date,
      dateStr,
      day: date.getDate(),
      bookings: dayBookings,
      isAvailable: status !== 'booked',
      availableSlots: maxCapacity - totalGuests,
      totalGuests,
      maxCapacity,
      status,
      revenue,
      weather: randomWeather
    };
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'; // Green for available
      case 'limited':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'; // Yellow for limited
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'; // RED for fully booked
      case 'blocked':
        return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'; // Gray for blocked
      default:
        return 'bg-gray-50 text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">Available</span>;
      case 'limited':
        return <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">Limited</span>;
      case 'booked':
        return <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">Fully Booked</span>;
      case 'blocked':
        return <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">Blocked</span>;
      default:
        return null;
    }
  };

  const getWeatherIcon = (weather?: 'sunny' | 'cloudy' | 'rainy') => {
    switch(weather) {
      case 'sunny':
        return <Sun size={16} className="text-amber-500" />;
      case 'cloudy':
        return <Cloud size={16} className="text-gray-500" />;
      case 'rainy':
        return <CloudRain size={16} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + (direction === 'next' ? 1 : -1),
      1
    ));
    setSelectedDay(null);
    setShowDetails(false);
  };

  const handleDayClick = (day: DayAvailability) => {
    setSelectedDay(day);
    setShowDetails(true);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  
  const days = viewType === 'month' 
    ? getDaysInMonth(currentDate) 
    : getWeekDays(currentDate);
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <RoleBasedLayout userName={userName} userRole="owner">
        <div className="animate-pulse p-8 space-y-8">
          <div className="h-20 bg-gray-200 rounded-2xl"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout userName={userName} userRole="owner">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Availability Calendar</h1>
            <p className="text-gray-500">View and manage venue bookings by date</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Venue Filter */}
            <select
              value={selectedVenue}
              onChange={(e) => {
                setSelectedVenue(e.target.value === 'all' ? 'all' : Number(e.target.value));
                setSelectedDay(null);
                setShowDetails(false);
              }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Venues</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex bg-white border rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewType('month')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewType === 'month' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewType('week')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewType === 'week' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
            </div>

            {/* Export Button */}
            <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500 font-bold uppercase">Total Revenue</p>
            <p className="text-2xl font-black mt-2">Rs. {stats.totalRevenue.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500 font-bold uppercase">Bookings</p>
            <p className="text-2xl font-black mt-2">{stats.totalBookings}</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500 font-bold uppercase">Occupancy</p>
            <p className="text-2xl font-black mt-2">{stats.occupancyRate}%</p>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${stats.occupancyRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-500 font-bold uppercase">Available</p>
            </div>
            <p className="text-2xl font-black">{stats.availableDays} days</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <p className="text-sm text-gray-500 font-bold uppercase">Booked</p>
            </div>
            <p className="text-2xl font-black">{stats.bookedDays} days</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mb-6 p-4 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-sm font-medium text-gray-600">Available (&lt;70% full)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span className="text-sm font-medium text-gray-600">Limited (70-99% full)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="text-sm font-medium text-gray-600 font-bold text-red-600">FULLY BOOKED (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-100 border-2 border-gray-300 rounded"></div>
            <span className="text-sm font-medium text-gray-600">Blocked/Closed</span>
          </div>
          <div className="flex items-center gap-2 ml-auto text-sm text-gray-400">
            <Info size={16} /> Click any date to see details
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900">
            {monthName} {year}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {/* Weekday headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center font-bold text-gray-400 text-sm py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, index) => {
            const dayData = getDayAvailability(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                onClick={() => isCurrentMonth && handleDayClick(dayData)}
                className={`
                  min-h-[120px] p-3 rounded-xl border-2 transition-all relative
                  ${isCurrentMonth ? 'cursor-pointer' : 'cursor-default opacity-50'}
                  ${isCurrentMonth ? getStatusColor(dayData.status) : 'bg-gray-50 text-gray-400 border-gray-200'}
                  ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  ${selectedDay?.dateStr === dayData.dateStr ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
                  ${dayData.status === 'booked' ? 'shadow-lg shadow-red-100' : ''}
                `}
              >
                {/* Booked Badge for Red Days */}
                {isCurrentMonth && dayData.status === 'booked' && (
                  <div className="absolute top-1 right-1">
                    <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                      FULL
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <span className={`font-bold ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {date.getDate()}
                  </span>
                  {isCurrentMonth && getWeatherIcon(dayData.weather)}
                </div>
                
                {isCurrentMonth && dayData.bookings.length > 0 && (
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <Users size={12} />
                      <span className={dayData.status === 'booked' ? 'text-red-700' : ''}>
                        {dayData.totalGuests}/{dayData.maxCapacity}
                      </span>
                    </div>
                    
                    {dayData.revenue > 0 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                        <DollarSign size={12} />
                        <span>Rs. {dayData.revenue.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayData.bookings.slice(0, 3).map(booking => (
                        <div
                          key={booking.id}
                          className={`w-2 h-2 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-500' :
                            booking.status === 'pending' ? 'bg-yellow-500' :
                            booking.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          title={`${booking.user.name} - ${booking.status}`}
                        />
                      ))}
                      {dayData.bookings.length > 3 && (
                        <span className="text-[10px] font-bold text-gray-500">
                          +{dayData.bookings.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {isCurrentMonth && dayData.bookings.length === 0 && dayData.status === 'available' && (
                  <div className="text-xs font-medium text-green-700 bg-green-200 px-2 py-1 rounded-full inline-block mt-2">
                    Available
                  </div>
                )}

                {isCurrentMonth && dayData.status === 'limited' && dayData.bookings.length === 0 && (
                  <div className="text-xs font-medium text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full inline-block mt-2">
                    Limited Slots
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Day Details Panel */}
        {showDetails && selectedDay && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDay.date.toLocaleDateString('default', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  {getStatusBadge(selectedDay.status)}
                  <span className="text-sm text-gray-500">
                    {selectedDay.availableSlots} slots available out of {selectedDay.maxCapacity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Occupancy Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-gray-700">Occupancy</span>
                <span className="font-bold text-gray-900">
                  {Math.round((selectedDay.totalGuests / selectedDay.maxCapacity) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div 
                  className={`h-3 rounded-full ${
                    selectedDay.status === 'booked' ? 'bg-red-500' :
                    selectedDay.status === 'limited' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(selectedDay.totalGuests / selectedDay.maxCapacity) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Bookings for the day */}
            {selectedDay.bookings.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                  <BookOpen size={18} />
                  Bookings for this day ({selectedDay.bookings.length})
                </h4>
                {selectedDay.bookings.map(booking => (
                  <Link
                    key={booking.id}
                    href={`/owner/bookings/${booking.id}`}
                    className={`
                      block p-4 rounded-xl border-2 hover:shadow-md transition-all
                      ${booking.status === 'confirmed' ? 'border-green-200 bg-green-50' :
                        booking.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                        booking.status === 'completed' ? 'border-blue-200 bg-blue-50' :
                        'border-red-200 bg-red-50'}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{booking.user.name}</p>
                        <p className="text-sm text-gray-500">{booking.venue.name}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        Rs. {booking.total_amount.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={14} />
                        {booking.guest_count} guests
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} />
                        {booking.event_type}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} />
                        {booking.venue.city}
                      </div>
                    </div>
                    
                    {booking.special_requests && (
                      <p className="mt-2 text-xs text-gray-500 italic bg-white p-2 rounded-lg">
                        Note: {booking.special_requests}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                <CalendarIcon size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">No bookings for this day</p>
                <p className="text-sm mt-1">
                  {selectedDay.status === 'booked' ? 
                    'This date is marked as fully booked' : 
                    'This date is available for new bookings'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
}