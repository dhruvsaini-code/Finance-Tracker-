import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../services/apiService';
import { useAuthStore } from '../store/authStore';
import GlassCard from '../components/ui/GlassCard';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFields = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setIsSubmitting(true);
    try {
      const response = await authService.register({
        username: data.username,
        email: data.email,
        password: data.password
      });
      setCredentials(response.user, response.token);
      toast.success(`Account created! Welcome, ${response.user.username}!`);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1220] transition-colors duration-300 relative px-4 overflow-hidden">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '-8s' }}></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/30 mb-3">
            F
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
            FinanceSaaS
          </h2>
        </div>

        {/* Card Panel */}
        <GlassCard glow className="p-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-6">
            Create Your Account
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-left">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="johndoe"
                  {...register('username')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/60 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 text-left">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-left">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/60 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 text-left">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-left">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/60 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 text-left">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-400 mb-1.5 uppercase tracking-wider text-left">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/60 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 text-left">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                  <span>Signing Up...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>

          </form>

          {/* Prompt to login */}
          <p className="text-slate-400 dark:text-slate-400 text-xs text-center mt-6">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-indigo-500 dark:text-indigo-400 font-semibold hover:underline"
            >
              Log In
            </Link>
          </p>

        </GlassCard>

      </div>
    </div>
  );
};
export default Register;
