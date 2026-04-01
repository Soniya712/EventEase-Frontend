"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check login status on component mount
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('user_name');
    if (token) {
      setIsLoggedIn(true);
      setUserName(name || '');
    }
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    
    // Update state
    setIsLoggedIn(false);
    setUserName('');
    setIsProfileOpen(false);
    
    // Redirect to home page
    router.push('/');
    router.refresh(); // Refresh to update the UI
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">EventEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-pink-600 font-medium">
              Home
            </Link>
            <Link href="/venues" className="text-gray-700 hover:text-pink-600 font-medium">
              Browse Venues
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-pink-600 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-pink-600 font-medium">
              Contact
            </Link>
            <Link href="/list-your-business" className="text-gray-700 hover:text-pink-600 font-medium">
              List Your Business
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Profile Dropdown for logged-in users */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      {userName ? (
                        <span className="text-white font-semibold">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="text-white" size={20} />
                      )}
                    </div>
                    <span className="hidden md:inline text-gray-700 font-medium">
                      {userName}
                    </span>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Calendar size={18} />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User size={18} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/my-events"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Calendar size={18} />
                        <span>My Events</span>
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login/Signup buttons for non-logged-in users */}
                <Link
                  href="/login"
                  className="px-6 py-2 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/venues"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Venues
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/list-your-business"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                List Your Business
              </Link>
              
              <hr className="my-2" />
              
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/my-events"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Events
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}