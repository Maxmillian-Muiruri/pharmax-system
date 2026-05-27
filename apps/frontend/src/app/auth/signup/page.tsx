import { useState, type FormEvent } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';

interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function Signup() {
  return <SignUpPage />;
}

export default function SignUpPage() {
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!registerData.username || !registerData.fullName || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      addToast({ type: 'error', message: 'Please fill in all fields', duration: 3000 });
      return;
    }

    if (registerData.password.length < 8) {
      addToast({ type: 'error', message: 'Password must be at least 8 characters', duration: 3000 });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      addToast({ type: 'error', message: 'Passwords do not match', duration: 3000 });
      return;
    }

    addToast({ type: 'info', message: 'Creating your account...', duration: 2000 });
    try {
      await register({
        name: registerData.fullName,
        email: registerData.email,
        password: registerData.password,
        phoneNumber: '', // Additional fields map can be expanded
      });
      addToast({ type: 'success', message: 'Account created successfully!', duration: 3000 });
      navigate('/');
    } catch (error: any) {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to create account', duration: 3000 });
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#0d4f5c] mb-1">Create account</h2>
      <p className="text-gray-500 mb-6">Fill in your details to get started</p>

      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="john_doe"
              value={registerData.username}
              onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d4f5c] focus:border-[#0d4f5c] outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="John Doe"
              value={registerData.fullName}
              onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d4f5c] focus:border-[#0d4f5c] outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder="you@example.com"
              value={registerData.email}
              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d4f5c] focus:border-[#0d4f5c] outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={registerData.password}
              onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d4f5c] focus:border-[#0d4f5c] outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              placeholder="Repeat your password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d4f5c] focus:border-[#0d4f5c] outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-[#0d4f5c] text-white font-semibold rounded-lg cursor-pointer transition-all hover:bg-[#164e63] active:scale-[0.98] shadow-lg hover:shadow-xl mb-6"
        >
          Create account
        </button>

        <div className="text-center text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            className="text-[#0d4f5c] font-semibold cursor-pointer bg-none border-none p-0 hover:text-[#164e63] hover:underline"
            onClick={() => navigate('/auth')}
          >
            Sign in
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">© 2026 Pharmacie Nouni. All rights reserved.</div>
      </form>
    </div>
  );
}
