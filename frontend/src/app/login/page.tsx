'use client';

import React, { useState } from "react";
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Link } from "@nextui-org/react";
import { Mail, Lock, LogIn } from "lucide-react";
import { useRouter } from 'next/navigation';

interface LoginForm {
  username: string;
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    username: localStorage.getItem("username") || '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });

  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: '', password: '' };

    if (!formData.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3001/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          if (formData.rememberMe) {
            localStorage.setItem("username", formData.username);
          } else {
            localStorage.removeItem("username");
          }
          router.push("/landing");
          setFormData({ username: '', password: '', rememberMe: false });
        } else {
          const errorData = await response.json();
          setGeneralError(errorData.error || 'Login failed');
          setErrors(prev => ({ ...prev, password: errorData.error || 'Login failed' }));
        }
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Card className="max-w-md w-full px-4 py-6 shadow-xl">
      <CardHeader className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
        <p className="text-sm text-default-500 text-center">
          Please sign in to continue
        </p>
        {generalError && <p className="text-red-500 text-center">{generalError}</p>} {/* Display general error */}
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text" // Changed to "text"
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            errorMessage={errors.username}
            isInvalid={!!errors.username}
            placeholder="Enter your username"
            labelPlacement="outside"
            startContent={
              <Mail className="text-default-400 pointer-events-none flex-shrink-0" size={18} />
            }
          />
          
          <Input
            type="password"
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            errorMessage={errors.password}
            isInvalid={!!errors.password}
            placeholder="Enter your password"
            labelPlacement="outside"
            startContent={
              <Lock className="text-default-400 pointer-events-none flex-shrink-0" size={18} />
            }
          />
          
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="form-checkbox h-4 w-4 text-primary rounded border-gray-300"
              />
              <span className="text-sm">Remember me</span>
            </label>
            <Link href="#" size="sm" className="text-primary">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full mt-2"
            endContent={isLoading ? <span>Loading...</span> : <LogIn size={18} />}
            disabled={isLoading} // Disable button during loading
          >
            {isLoading ? 'Signing In...' : 'Sign In'} {/* Update button text */}
          </Button>
        </form>
      </CardBody>
      
      <CardFooter className="flex justify-center">
        <p className="text-center text-sm text-default-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" size="sm" className="text-primary">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
