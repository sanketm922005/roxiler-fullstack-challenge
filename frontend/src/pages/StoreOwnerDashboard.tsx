import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { StarRating } from '../components/StarRating';
import { Store, Star, Users, MapPin, Mail, Award, AlertCircle } from 'lucide-react';

interface RatingRecord {
  id: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
}

interface OwnerDashboardData {
  hasStore: boolean;
  message?: string;
  store: {
    id: string;
    name: string;
    email: string;
    address: string;
  } | null;
  averageRating: number;
  totalRatings: number;
  ratings: RatingRecord[];
}

export const StoreOwnerDashboard: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/owner/dashboard?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [sortBy, sortOrder]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const columns: Column<RatingRecord>[] = [
    {
      key: 'userName',
      header: 'Customer Name',
      sortable: true,
      render: (r) => <span className="font-semibold text-slate-800">{r.user.name}</span>,
    },
    {
      key: 'userEmail',
      header: 'Customer Email',
      sortable: true,
      render: (r) => <span className="text-slate-600">{r.user.email}</span>,
    },
    {
      key: 'userAddress',
      header: 'Customer Address',
      render: (r) => <span className="line-clamp-2 text-xs text-slate-500">{r.user.address}</span>,
    },
    {
      key: 'rating',
      header: 'Rating Submitted',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <StarRating rating={r.rating} size="sm" showNumber />
          <span className="text-xs font-bold text-amber-600">({r.rating}/5)</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      sortable: true,
      render: (r) => (
        <span className="text-xs text-slate-400">
          {new Date(r.createdAt).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Store Owner Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor your store's customer feedback, average ratings, and review history.
        </p>
      </div>

      {loading && !data ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading store dashboard...</span>
          </div>
        </div>
      ) : !data?.hasStore ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-lg">No Store Assigned</h3>
          <p className="text-xs text-slate-600 mt-1">
            {data?.message || 'Your account does not have an active store assigned yet. Contact the Administrator.'}
          </p>
        </div>
      ) : (
        <>
          {/* Store Info & Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Store Information */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                      Managed Store
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {data.store?.name}
                    </h2>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mt-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{data.store?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{data.store?.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Account Status: Active</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  Verified Storefront
                </span>
              </div>
            </div>

            {/* Average Rating Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-indigo-900/10 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                  Average Rating
                </span>
                <Award className="w-6 h-6 text-amber-400" />
              </div>

              <div className="my-4 text-center">
                <span className="text-5xl font-black tracking-tight text-white block">
                  {data.averageRating > 0 ? data.averageRating.toFixed(2) : '0.0'}
                </span>
                <div className="mt-2 flex justify-center">
                  <StarRating rating={data.averageRating} size="md" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-indigo-200 pt-3 border-t border-indigo-700/60">
                <span>Customer Submissions</span>
                <span className="font-bold text-white text-sm">
                  {data.totalRatings} {data.totalRatings === 1 ? 'Rating' : 'Ratings'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Reviews Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-lg">
                  Users Who Rated Your Store
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Total Reviews: {data.ratings.length}
              </span>
            </div>

            <DataTable
              columns={columns}
              data={data.ratings}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              emptyMessage="No customers have rated your store yet."
            />
          </div>
        </>
      )}
    </div>
  );
};
