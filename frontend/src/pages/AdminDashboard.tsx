import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { StarRating } from '../components/StarRating';
import {
  Users,
  Store as StoreIcon,
  Star,
  Plus,
  Search,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
  rating: number | null;
  storeName: string | null;
  totalRatings: number;
}

interface StoreRecord {
  id: string;
  name: string;
  email: string;
  address: string;
  rating: number;
  totalRatings: number;
  owner?: { id: string; name: string; email: string } | null;
}

export const AdminDashboard: React.FC = () => {
  // Stats
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  // Tab: 'users' or 'stores'
  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');

  // Users state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [userSort, setUserSort] = useState<{ by: string; order: 'asc' | 'desc' }>({
    by: 'name',
    order: 'asc',
  });

  // Stores state
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [storeSort, setStoreSort] = useState<{ by: string; order: 'asc' | 'desc' }>({
    by: 'name',
    order: 'asc',
  });

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [availableOwners, setAvailableOwners] = useState<Array<{ id: string; name: string; email: string }>>([]);

  // Add User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
  });
  const [userModalError, setUserModalError] = useState<string | null>(null);
  const [userModalSubmitting, setUserModalSubmitting] = useState(false);

  // Add Store Form State
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [storeModalError, setStoreModalError] = useState<string | null>(null);
  const [storeModalSubmitting, setStoreModalSubmitting] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy: userSort.by,
        sortOrder: userSort.order,
        ...(userFilters.name && { name: userFilters.name }),
        ...(userFilters.email && { email: userFilters.email }),
        ...(userFilters.address && { address: userFilters.address }),
        ...(userFilters.role && { role: userFilters.role }),
      });
      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const params = new URLSearchParams({
        sortBy: storeSort.by,
        sortOrder: storeSort.order,
        ...(storeFilters.name && { name: storeFilters.name }),
        ...(storeFilters.email && { email: storeFilters.email }),
        ...(storeFilters.address && { address: storeFilters.address }),
      });
      const res = await api.get(`/admin/stores?${params.toString()}`);
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setStoresLoading(false);
    }
  };

  // Fetch available owners for store creation
  const fetchAvailableOwners = async () => {
    try {
      const res = await api.get('/admin/available-owners');
      setAvailableOwners(res.data.owners);
    } catch (err) {
      console.error('Failed to fetch available owners:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userSort, userFilters]);

  useEffect(() => {
    fetchStores();
  }, [storeSort, storeFilters]);

  // Handle User Sorting
  const handleUserSort = (key: string) => {
    setUserSort((prev) => ({
      by: key,
      order: prev.by === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle Store Sorting
  const handleStoreSort = (key: string) => {
    setStoreSort((prev) => ({
      by: key,
      order: prev.by === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Add User Submission
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError(null);

    // Validate name 20-60
    if (newUser.name.length < 20 || newUser.name.length > 60) {
      setUserModalError('Name must be between 20 and 60 characters long.');
      return;
    }
    // Validate password 8-16, uppercase, special
    const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
    if (!pwRegex.test(newUser.password)) {
      setUserModalError('Password must be 8-16 chars with at least one uppercase letter and one special character.');
      return;
    }

    setUserModalSubmitting(true);
    try {
      await api.post('/admin/users', newUser);
      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      setUserModalError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setUserModalSubmitting(false);
    }
  };

  // Add Store Submission
  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreModalError(null);

    if (newStore.name.length < 20 || newStore.name.length > 60) {
      setStoreModalError('Store Name must be between 20 and 60 characters long.');
      return;
    }

    setStoreModalSubmitting(true);
    try {
      await api.post('/admin/stores', {
        name: newStore.name,
        email: newStore.email,
        address: newStore.address,
        ownerId: newStore.ownerId || undefined,
      });
      setIsAddStoreOpen(false);
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
    } catch (err: any) {
      setStoreModalError(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setStoreModalSubmitting(false);
    }
  };

  // User Table Columns
  const userColumns: Column<UserRecord>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (u) => (
        <div>
          <span className="font-semibold text-slate-800 block">{u.name}</span>
          {u.storeName && (
            <span className="text-xs text-indigo-600 font-medium">Store: {u.storeName}</span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (u) => <span className="line-clamp-2 text-xs">{u.address}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => {
        const badgeColors = {
          ADMIN: 'bg-rose-50 text-rose-700 border-rose-200',
          STORE_OWNER: 'bg-amber-50 text-amber-800 border-amber-200',
          USER: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        }[u.role];
        return (
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeColors}`}>
            {u.role}
          </span>
        );
      },
    },
    {
      key: 'rating',
      header: 'Store Owner Rating',
      sortable: true,
      render: (u) => {
        if (u.role === 'STORE_OWNER') {
          return u.rating !== null ? (
            <div className="flex items-center gap-1.5">
              <StarRating rating={u.rating} size="sm" showNumber />
              <span className="text-xs text-slate-400">({u.totalRatings})</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">No store assigned</span>
          );
        }
        return <span className="text-xs text-slate-400">N/A</span>;
      },
    },
  ];

  // Store Table Columns
  const storeColumns: Column<StoreRecord>[] = [
    {
      key: 'name',
      header: 'Store Name',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-semibold text-slate-800 block">{s.name}</span>
          {s.owner ? (
            <span className="text-xs text-slate-500">Owner: {s.owner.name}</span>
          ) : (
            <span className="text-xs text-slate-400 italic">No owner assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'address',
      header: 'Address',
      sortable: true,
      render: (s) => <span className="line-clamp-2 text-xs">{s.address}</span>,
    },
    {
      key: 'rating',
      header: 'Average Rating',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-1.5">
          <StarRating rating={s.rating} size="sm" showNumber />
          <span className="text-xs text-slate-400">({s.totalRatings} ratings)</span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            System Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage stores, user accounts, and monitor system metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsAddStoreOpen(true);
              fetchAvailableOwners();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-sm hover:bg-slate-50 transition"
          >
            <Building className="w-4 h-4 text-indigo-600" />
            <span>Add Store</span>
          </button>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-indigo-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Total Users
            </span>
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalUsers}</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Registered Stores
            </span>
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalStores}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <StoreIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Submitted Ratings
            </span>
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalRatings}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition duration-150 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`pb-3 text-sm font-bold border-b-2 transition duration-150 flex items-center gap-2 ${
            activeTab === 'stores'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>Stores Directory</span>
        </button>
      </div>

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Filter by Name</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name..."
                  value={userFilters.name}
                  onChange={(e) => setUserFilters((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Filter by Email</label>
              <input
                type="text"
                placeholder="Search email..."
                value={userFilters.email}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Filter by Address</label>
              <input
                type="text"
                placeholder="Search address..."
                value={userFilters.address}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Filter by Role</label>
              <select
                value={userFilters.role}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="USER">Normal User</option>
              </select>
            </div>
          </div>

          {/* User Table with Sorting */}
          <DataTable
            columns={userColumns}
            data={users}
            sortBy={userSort.by}
            sortOrder={userSort.order}
            onSort={handleUserSort}
            isLoading={usersLoading}
            emptyMessage="No users found matching the filter criteria."
          />
        </div>
      )}

      {/* Tab: Stores */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          {/* Store Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Filter by Store Name</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search store name..."
                  value={storeFilters.name}
                  onChange={(e) => setStoreFilters((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Filter by Store Email</label>
              <input
                type="text"
                placeholder="Search email..."
                value={storeFilters.email}
                onChange={(e) => setStoreFilters((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Filter by Address</label>
              <input
                type="text"
                placeholder="Search address..."
                value={storeFilters.address}
                onChange={(e) => setStoreFilters((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Store Table with Sorting */}
          <DataTable
            columns={storeColumns}
            data={stores}
            sortBy={storeSort.by}
            sortOrder={storeSort.order}
            onSort={handleStoreSort}
            isLoading={storesLoading}
            emptyMessage="No stores found matching the filter criteria."
          />
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Add New User</h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              {userModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{userModalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name (20–60 characters)
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Shinde Regional Head"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Address (Max 400 characters)
                </label>
                <textarea
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  rows={2}
                  maxLength={400}
                  placeholder="Residential or Office address"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USER">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Password (8-16 chars, 1 Upper, 1 Special)
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userModalSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  {userModalSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Add New Store</h3>
              <button
                onClick={() => setIsAddStoreOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStoreSubmit} className="p-6 space-y-4">
              {storeModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{storeModalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Store Name (20–60 characters)
                </label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  placeholder="e.g. Horizon Organics Flagship Store"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Store Email
                </label>
                <input
                  type="email"
                  value={newStore.email}
                  onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                  placeholder="contact@storename.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Store Address (Max 400 characters)
                </label>
                <textarea
                  value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                  rows={2}
                  maxLength={400}
                  placeholder="Physical store address..."
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Assign Store Owner (Optional)
                </label>
                <select
                  value={newStore.ownerId}
                  onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No owner assigned yet</option>
                  {availableOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Only users with role STORE_OWNER without an active store appear here.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={storeModalSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  {storeModalSubmitting ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
