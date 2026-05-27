import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface UserData {
  userId?: string;
  email: string;
  loggedIn?: boolean;
  loginTime?: string;
}

export const Signin = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const navigate = useNavigate();

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    toast.loading('Signing in...');

    setTimeout(() => {
      toast.dismiss();

      const user: UserData = {
        userId: 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        email: loginData.email,
        loggedIn: true,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('pharmacie_user', JSON.stringify(user));
      window.dispatchEvent(new Event('auth-change'));

      toast.success('Welcome back!');
      navigate('/');
    }, 1000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#0d4f5c] mb-1">Sign in</h2>
      <p className="text-gray-500 mb-6">Enter your credentials to access your account</p>

      <form onSubmit={handleLogin}>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={loginData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d4f5c] focus:border-[#0d4f5c] outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d4f5c] focus:border-[#0d4f5c] outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={loginData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 text-[#0d4f5c] rounded focus:ring-[#0d4f5c] cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <span className="text-sm text-[#0d4f5c] cursor-pointer hover:text-[#164e63] hover:underline">Forgot password?</span>
        </div>

        <button 
          type="submit" 
          className="w-full py-3.5 bg-[#0d4f5c] text-white font-semibold rounded-lg cursor-pointer transition-all hover:bg-[#164e63] active:scale-[0.98] shadow-lg hover:shadow-xl mb-6"
        >
          Sign in
        </button>

        <div className="text-center text-gray-600">
          Don't have an account?{' '}
          <button 
            type="button" 
            className="text-[#0d4f5c] font-semibold cursor-pointer bg-none border-none p-0 hover:text-[#164e63] hover:underline"
            onClick={() => navigate('/auth/signup')}
          >
            Create account
          </button>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">© 2026 Pharmacie Nouni. All rights reserved.</div>
      </form>
    </div>
  );
};

export default Signin;
