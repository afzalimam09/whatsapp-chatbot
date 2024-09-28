import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../requestMethods';
import { AccountContext } from '../context/AccountProvider';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAccount } = useContext(AccountContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ email, password });
    try {
      setLoading(true)
      const { data } = await apiRequest.post("/auth/login", { email, password });
      setAccount(data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-8">
        
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Logo" className="w-20 h-20" />
        </div>

        {/* Text below Logo */}
        <h3 className="text-center text-2xl font-bold text-gray-300 mb-6">Login to your account</h3>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/Username Field */}
          <div className='flex flex-col gap-2'>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email or username"
            />
          </div>

          {/* Password Field */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {!loading ? "Login" : "Please wait..."}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;