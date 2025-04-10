import { useState } from 'react';
import { useRouter } from 'next/router';
import useRequest from '../../hooks/use-request';
import ContentContainer from '../../components/content-container';

const NewTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { doRequest, fieldErrors, otherErrors, setFieldErrors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price },
    onSuccess: () => {
      router.push('/');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setTimeout(async () => {
        await doRequest();
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      setFieldErrors({ price: 'Price must be a number' });
    }
    setPrice(value.toString());
  };

  return (
    <ContentContainer>
      <div className='row justify-content-center'>
        <div className='col-md-8'>
          <div className='text-center mb-4'>
            <h1>Create New Ticket</h1>
            <p className='text-muted'>Fill in the details to list your ticket for sale</p>
          </div>

          <div className='card'>
            <div className='card-body'>
              <form onSubmit={handleSubmit}>
                <div className='mb-4'>
                  <label
                    htmlFor='title'
                    className='form-label'
                  >
                    <i className='bi bi-ticket-detailed me-2'></i>
                    Ticket Title
                  </label>
                  <input
                    autoFocus
                    type='text'
                    className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
                    id='title'
                    placeholder='Enter ticket title'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.title && (
                    <div className='invalid-feedback'>
                      <i className='bi bi-exclamation-circle me-1'></i>
                      {fieldErrors.title}
                    </div>
                  )}
                </div>

                <div className='mb-4'>
                  <label
                    htmlFor='price'
                    className='form-label'
                  >
                    <i className='bi bi-currency-dollar me-2'></i>
                    Price
                  </label>
                  <div className='input-group'>
                    <span className='input-group-text'>$</span>
                    <input
                      type='number'
                      className={`form-control ${fieldErrors.price ? 'is-invalid' : ''}`}
                      id='price'
                      placeholder='Enter price'
                      value={price}
                      onBlur={onBlur}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isSubmitting}
                      min='0'
                      step='0.01'
                    />
                  </div>
                  {fieldErrors.price && (
                    <div className='invalid-feedback'>
                      <i className='bi bi-exclamation-circle me-1'></i>
                      {fieldErrors.price}
                    </div>
                  )}
                </div>

                <div className='d-grid'>
                  <button
                    type='submit'
                    className='btn btn-primary py-3'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className='spinner-border spinner-border-sm me-2'
                          role='status'
                          aria-hidden='true'
                        ></span>
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <i className='bi bi-plus-circle me-2'></i>
                        Create Ticket
                      </>
                    )}
                  </button>
                </div>

                {otherErrors.length > 0 && (
                  <div className='alert alert-danger mt-4'>
                    <h5 className='alert-heading'>
                      <i className='bi bi-exclamation-triangle me-2'></i>
                      Oops...
                    </h5>
                    <ul className='mb-0'>
                      {otherErrors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
};

export default NewTicket;
