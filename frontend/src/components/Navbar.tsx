import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, KeyRound, Store, ShieldCheck, User as UserIcon } from 'lucide-react';
import { PasswordChangeModal } from './PasswordChangeModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) return null;

  const roleConfig = {
    ADMIN: {
      label: 'System Admin',
      badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
      icon: ShieldCheck,
    },
    STORE_OWNER: {
      label: 'Store Owner',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Store,
    },
    USER: {
      label: 'Normal User',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: UserIcon,
    },
  }[user.role];

  const RoleIcon = roleConfig.icon;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                  StoreRate
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400">
                  Roxiler Challenge
                </span>
              </div>
            </div>

            {/* User profile & actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={user.name}>
                  {user.name}
                </span>
                <span className="text-xs text-slate-400 truncate max-w-[200px]">
                  {user.email}
                </span>
              </div>

              {/* Role badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleConfig.badgeClass}`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{roleConfig.label}</span>
              </div>

              {/* Update Password button */}
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-xl transition"
                title="Change Password"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Change Password</span>
              </button>

              {/* Logout button */}
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
