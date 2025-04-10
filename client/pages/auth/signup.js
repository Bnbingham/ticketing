import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useRequest from '../../hooks/use-request';
import AuthContainer from '../../components/auth-container';

const signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { doRequest, fieldErrors, otherErrors } = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: { email, password },
    onSuccess: () => {
      router.push('/');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await doRequest();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthContainer
      title='Create Account'
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      otherErrors={otherErrors}
      linkText='Already have an account?'
      linkHref='/auth/signin'
      linkLabel='Sign in'
    >
      <div className='mb-3'>
        <label
          htmlFor='email'
          className='form-label'
        >
          Email address
        </label>
        <input
          type='email'
          className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
          id='email'
          placeholder='Enter email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
        {fieldErrors.email && <div className='invalid-feedback'>{fieldErrors.email}</div>}
      </div>
      <div className='mb-4'>
        <label
          htmlFor='password'
          className='form-label'
        >
          Password
        </label>
        <input
          type='password'
          className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
          id='password'
          placeholder='Enter password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />
        {fieldErrors.password && <div className='invalid-feedback'>{fieldErrors.password}</div>}
      </div>
      <div className='d-grid'>
        <button
          type='submit'
          className='btn btn-primary'
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className='spinner-border spinner-border-sm me-2'
                role='status'
                aria-hidden='true'
              ></span>
              Creating Account...
            </>
          ) : (
            'Sign Up'
          )}
        </button>
      </div>
    </AuthContainer>
  );
};

export default signup;
