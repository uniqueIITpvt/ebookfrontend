'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  StarIcon,
  BookOpenIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

export default function UserProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'orders'>('overview');

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/');
    return null;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-lg shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-lg">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                    {user.role}
                  </span>
                  {user.subscriptionPlan && user.subscriptionPlan !== 'none' && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize">
                      {user.subscriptionPlan} Plan
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Link
                  href="/subscription"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  {user.subscriptionPlan && user.subscriptionPlan !== 'none' ? 'Manage Plan' : 'Subscribe'}
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-6 py-2.5 border border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-100">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'subscription' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Subscription
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === 'orders' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Orders
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                    <StarIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Subscription</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {user.subscriptionPlan && user.subscriptionPlan !== 'none' 
                      ? user.subscriptionPlan 
                      : 'Free'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <BookOpenIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Books Access</p>
                  <p className="font-semibold text-gray-900">
                    {user.subscriptionPlan === 'pro' ? 'Unlimited' : 
                     user.subscriptionPlan === 'premium' ? 'Premium + Standard' :
                     user.subscriptionPlan === 'basic' ? 'Standard Only' : 'Limited'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <EnvelopeIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Email Status</p>
                  <p className="font-semibold text-gray-900">
                    {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Current Subscription</h3>
                {user.subscriptionPlan && user.subscriptionPlan !== 'none' ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold capitalize mb-2">
                          {user.subscriptionPlan}
                        </span>
                        <p className="text-gray-600">Status: <span className="font-semibold text-green-600 capitalize">{user.subscriptionStatus}</span></p>
                        {user.subscriptionEndDate && (
                          <p className="text-gray-600 mt-1">
                            Valid until: {new Date(user.subscriptionEndDate).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/subscription"
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Upgrade/Manage
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 mb-4">You don't have an active subscription</p>
                    <Link
                      href="/subscription"
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Plans
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No orders yet</p>
                <p className="text-gray-500 text-sm mb-4">Start exploring our book collection</p>
                <Link
                  href="/books"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Browse Books
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
