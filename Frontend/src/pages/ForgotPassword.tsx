import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '../components/ui/GlassCard';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFields) => {
    setIsSubmitting(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success(`Verification link sent to ${data.email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1220] transition-colors duration-300 relative px-4 overflow-hidden">
      
      {/* Decorative Spheres */}
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
          
          {!isSubmitted ? (
            <>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-2">
                Forgot Password?
              </h3>
              <p className="text-slate-400 dark:text-slate-400 text-xs text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>

              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Mail size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                Check Your Email
              </h3>
              <p className="text-slate-400 dark:text-slate-400 text-xs mb-6 px-4">
                We've sent a password reset link to your email address. Please follow the instructions to secure your account.
              </p>
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <Link 
              to="/login" 
              className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center space-x-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>
          </div>

        </GlassCard>

      </div>
    </div>
  );
};
export default ForgotPassword;
