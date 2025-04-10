import React from 'react';

const AuthContainer = ({
  title,
  children,
  onSubmit,
  otherErrors,
  linkText,
  linkHref,
  linkLabel,
}) => {
  return (
    <div className='container mt-5'>
      <div className='row justify-content-center'>
        <div className='col-md-6 col-lg-4'>
          <div className='card shadow'>
            <div className='card-body'>
              <h2 className='card-title text-center mb-4'>{title}</h2>
              <form
                onSubmit={onSubmit}
                noValidate
              >
                {children}
                {otherErrors && otherErrors.length > 0 && (
                  <div className='alert alert-danger'>
                    <h6 className='alert-heading'>Oops!</h6>
                    <ul className='mb-0 ps-3'>
                      {otherErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className='text-center mt-3'>
                  <p className='mb-0'>
                    {linkText}{' '}
                    <a
                      href={linkHref}
                      className='text-decoration-none'
                    >
                      {linkLabel}
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
