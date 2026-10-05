import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StarRating } from '../components/StarRating';
import { Search, MapPin, Store, Star, ArrowUpDown, ArrowUp, ArrowDown, Check, X } from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  email: string;
  address: string;
  overallRating: number;
  totalRatings: number;
  userSubmittedRating: number | null;
}

export const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Rating modal state
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [pendingRating, setPendingRating] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        ...(searchName && { name: searchName }),
        ...(searchAddress && { address: searchAddress }),
      });
      const res = await api.get(`/stores?${params.toString()}`);
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [sortBy, sortOrder, searchName, searchAddress]);

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openRatingModal = (store: StoreItem) => {
    setSelectedStore(store);
    setPendingRating(store.userSubmittedRating || 5);
    setRatingMessage(null);
  };

  const handleSaveRating = async () => {
    if (!selectedStore) return;
    setIsSubmittingRating(true);
    setRatingMessage(null);

    try {
      await api.post('/ratings', {
        storeId: selectedStore.id,
        rating: pendingRating,
      });

      setRatingMessage('Your rating has been saved successfully!');
      setTimeout(() => {
        setSelectedStore(null);
        fetchStores();
      }, 1000);
    } catch (err: any) {
      setRatingMessage(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Browse Registered Stores
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Explore stores in your city, submit your honest ratings, and update your previous ratings anytime.
          </p>
        </div>
      </div>

      {/* Search and Sort Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {/* Search by Name */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search stores by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Search by Address */}
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by address or location..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Sorting Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Sort:
          </span>
          <button
            onClick={() => handleSortToggle('name')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition ${
              sortBy === 'name'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Name</span>
            {sortBy === 'name' && (
              sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => handleSortToggle('overallRating')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition ${
              sortBy === 'overallRating'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Rating</span>
            {sortBy === 'overallRating' && (
              sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Stores List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading registered stores...</span>
          </div>
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
          <Store className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No stores found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or clear filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-slate-800 text-base leading-snug">
                    {store.name}
                  </h3>
                  <div className="shrink-0 p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Store className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-slate-500 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{store.address}</span>
                </div>

                {/* Overall Rating Section */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Overall Rating
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {store.overallRating > 0 ? `${store.overallRating.toFixed(1)} / 5.0` : 'Not rated'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <StarRating rating={store.overallRating} size="sm" />
                    <span className="text-xs text-slate-400">
                      {store.totalRatings} {store.totalRatings === 1 ? 'rating' : 'ratings'}
                    </span>
                  </div>
                </div>

                {/* User's Rating Status */}
                <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 mb-5">
                  <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block mb-1.5">
                    Your Submitted Rating
                  </span>
                  {store.userSubmittedRating !== null ? (
                    <div className="flex items-center justify-between">
                      <StarRating rating={store.userSubmittedRating} size="sm" />
                      <span className="text-xs font-bold text-indigo-900">
                        {store.userSubmittedRating} / 5 stars
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      You haven't rated this store yet.
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => openRatingModal(store)}
                className={`w-full py-2.5 px-4 font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 ${
                  store.userSubmittedRating !== null
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>
                  {store.userSubmittedRating !== null ? 'Modify Your Rating' : 'Submit Rating'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submit / Modify Rating Modal */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">
                {selectedStore.userSubmittedRating !== null ? 'Modify Your Rating' : 'Rate This Store'}
              </h3>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 text-center space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base">{selectedStore.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{selectedStore.address}</p>
              </div>

              {ratingMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{ratingMessage}</span>
                </div>
              )}

              {/* Interactive Star Picker */}
              <div className="py-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Select rating (1 to 5 stars)
                </span>
                <StarRating
                  rating={pendingRating}
                  onRatingChange={(newVal) => setPendingRating(newVal)}
                  interactive={true}
                  size="lg"
                />
                <span className="text-sm font-bold text-indigo-600">
                  {pendingRating} of 5 Stars
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStore(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRating}
                disabled={isSubmittingRating}
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-200 transition"
              >
                {isSubmittingRating ? 'Saving...' : 'Confirm Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
