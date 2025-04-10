import React, { useState } from 'react';
import useRequest from '../../hooks/use-request';
import AuthContainer from '../../components/auth-container';
import { useRouter } from 'next/router';

const signin = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { doRequest, fieldErrors, otherErrors } = useRequest({
    url: '/api/users/signin',
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
      title='Sign In'
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      otherErrors={otherErrors}
      linkText="Don't have an account?"
      linkHref='/auth/signup'
      linkLabel='Sign up'
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
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </div>
    </AuthContainer>
  );
};

export default signin;
