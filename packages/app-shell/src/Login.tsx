import React, { useState } from 'react'
import { Button, FormControl, Alert, Loader } from 'react-components-lib.eaa'

interface LoginProps {
  onLogin: (token: string) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('eve.holt@reqres.in')
  const [password, setPassword] = useState('cityslicka')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bgLoaded, setBgLoaded] = useState(false)

  // Primary login handler: customize this authentication flow
  // to integrate with your backend or identity provider.
  // Developers should implement their application’s login logic here.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowAlert(false)
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('https://reqres.in/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'reqres-free-v1'
        },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.token) {
        onLogin(data.token)
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (err: any) {
      setError(err.message)
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative h-screen w-screen">
      {/* Placeholder */}
      {!bgLoaded && <div className="absolute inset-0 bg-gray-800" />}

      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1950&q=80"
        alt="Hands typing on laptop"
        className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-500 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setBgLoaded(true)}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-60" />

      {/* Centered container with max width 1200px */}
      <div className="relative h-full w-full max-w-[1200px] mx-auto">
        {/* Top-left SVG icon outside form box */}
        <img src="/logo.png" alt="SC Icon" className="absolute top-8 -left-6 max-w-[140px]" />
        <div className="absolute top-8 right-4 flex flex-col items-end">
          <p className="text-white text-[40px] -mb-[26px]">standard</p>
          <p className="text-white text-[40px]">chartered</p>
        </div>
        <div className="flex items-center justify-end h-full px-4">
          {/* Form container */}
          <div className="login-form relative w-full max-w-sm">
            {/* Form box with larger horizontal padding than vertical */}
            <div
              className="px-8 py-8 rounded shadow-lg text-white mt-6"
              style={{
                background:
                  'linear-gradient(132deg, rgba(44,58,136,0.9) 14%, rgba(0,97,200,0.9) 80%)'
              }}
            >
              <h2 className="text-2xl font-semibold mb-6">Welcome to Project_Name</h2>

              <div className="mb-6">
                <Alert
                  color="danger"
                  title="Login Error"
                  show={showAlert}
                  onClose={() => setShowAlert(false)}
                >
                  {error}
                </Alert>
              </div>

              <form onSubmit={handleSubmit}>
                <FormControl
                  label="Email"
                  labelClassName="text-white"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="mb-4"
                  autoFocus
                />

                <FormControl
                  label="Password"
                  labelClassName="text-white"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  iconRight={[
                    {
                      icon: showPassword ? 'eye-slash' : 'eye',
                      className: 'cursor-pointer',
                      onClick: () => setShowPassword((prev) => !prev)
                    }
                  ]}
                  className="mb-8"
                />

                <Button type="submit" fullWidth disabled={isLoading}>
                  {isLoading ? <Loader size="xs" /> : 'Login'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
