import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authService.login({ email, password });
      navigate('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Unable to sign in. Please try again.';

      if (error.message?.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email address';
      } else if (error.message?.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email';
      } else if (error.message?.includes('auth/wrong-password') || error.message?.includes('auth/invalid-credential')) {
        errorMessage = 'Incorrect password';
      } else if (error.message?.includes('auth/too-many-requests')) {
        errorMessage = 'Too many attempts. Please try again later';
      } else if (error.message?.includes('auth/network-request-failed')) {
        errorMessage = 'Network error. Please check your connection';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address first');
      setMessage(null);
      return;
    }

    setIsForgotPasswordLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authService.forgotPassword(email);
      setMessage('Password reset email sent! Check your inbox (and spam folder) for instructions.');
      setError(null);
    } catch (error: any) {
      let errorMessage = 'Unable to send reset email. Please try again.';

      if (error.message?.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email address';
      } else if (error.message?.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email';
      } else if (error.message?.includes('auth/too-many-requests')) {
        errorMessage = 'Too many attempts. Please try again later';
      } else if (error.message?.includes('auth/network-request-failed')) {
        errorMessage = 'Network error. Please check your connection';
      }

      setError(errorMessage);
      setMessage(null);
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-gray-50 dark:from-[#1a1a1a] dark:via-[#2d1b4e] dark:to-[#1a1a1a] overflow-hidden relative p-5 transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(102,126,234,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(118,75,162,0.08)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_50%,rgba(102,126,234,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(118,75,162,0.15)_0%,transparent_50%)] pointer-events-none"></div>
      
      <div className="w-full max-w-[1200px] flex items-center justify-center relative z-10">
        <div className="w-full max-w-[480px] flex flex-col items-center justify-center text-center">
          <h3 className="text-[2.5rem] font-medieval text-gray-900 dark:text-white mb-2">Log In</h3>
          <h4 className="text-xl text-gray-600 dark:text-[#bbb] mb-8 font-normal">Welcome back!</h4>

          <div className="w-full relative flex items-center justify-between rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 mb-4 transition-all text-xl hover:border-[#667eea] focus-within:border-[#667eea] shadow-sm dark:shadow-none">
            <input
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white text-xl p-0 w-full placeholder:text-gray-400 dark:placeholder:text-[#888] disabled:opacity-60 disabled:cursor-not-allowed"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={isLoading}
            />
            {email && (
              <button
                type="button"
                className="bg-transparent border-none text-gray-400 dark:text-[#aaa] text-2xl cursor-pointer px-2 leading-none transition-colors hover:text-gray-600 dark:hover:text-white"
                onClick={() => setEmail('')}
              >
                ×
              </button>
            )}
          </div>

          <div className="w-full relative flex items-center justify-between rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 mb-4 transition-all text-xl hover:border-[#667eea] focus-within:border-[#667eea] shadow-sm dark:shadow-none">
            <input
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white text-xl p-0 w-full placeholder:text-gray-400 dark:placeholder:text-[#888] disabled:opacity-60 disabled:cursor-not-allowed"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="bg-transparent border-none text-[#667eea] text-base font-semibold cursor-pointer p-0 mt-2 transition-colors hover:text-[#764ba2] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleForgotPassword}
              disabled={isForgotPasswordLoading}
            >
              {isForgotPasswordLoading ? 'Sending...' : 'FORGOT?'}
            </button>
          </div>

          <button 
            type="submit" 
            className="w-full h-[60px] mt-5 mb-4 rounded-2xl border-2 border-[#667eea] bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white cursor-pointer transition-all flex items-center justify-center relative shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:border-[#764ba2] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            <h4 className="text-lg font-semibold text-white m-0">LOGIN</h4>
          </button>

          {message && (
            <div className="w-full flex items-center justify-center mb-4">
              <h2 className="text-sm font-semibold text-green-600 dark:text-green-400 m-0 text-center">{message}</h2>
            </div>
          )}

          {error && (
            <div className="w-full flex items-center justify-center my-4">
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-500 m-0 text-center">
                {error.includes('email address first') || error.includes('send reset email') || error.includes('account found') 
                  ? error 
                  : 'There was an error logging in.'}
              </h2>
            </div>
          )}

          <div className="w-full flex justify-center mt-6">
            <h2 className="text-lg text-gray-600 dark:text-[#ddd] m-0 font-normal">
              Don't have an account?{' '}
              <span className="font-semibold underline cursor-pointer text-[#667eea] transition-colors hover:text-[#764ba2]" onClick={() => navigate('/signup')}>
                Create one
              </span>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;

