import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ContentContainer from '../../components/content-container';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useRequest from '../../hooks/use-request';

const stripePromise = loadStripe(
  'pk_test_51RCQir2cgsgLWvz8Rszwo4LC79mi73Fc8d0eosYGm6QJkFeWoipLHabUwTlQPzEPHFodgytJpR0Z1rlUy9uaxo14007iv1zLC0'
);

const CheckoutForm = ({ order, currentUser, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const { doRequest, otherErrors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcessing(false);
      return;
    }

    doRequest({ token: paymentMethod.id });
  };

  return (
    <div className='card'>
      <div className='card-body'>
        <h5 className='card-title mb-4'>Complete Your Purchase</h5>
        <div className='mb-4'>
          <p className='text-muted mb-2'>Order Details:</p>
          <div className='d-flex justify-content-between mb-2'>
            <span>Ticket:</span>
            <span>{order.ticket.title}</span>
          </div>
          <div className='d-flex justify-content-between mb-2'>
            <span>Price:</span>
            <span>${order.ticket.price}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='form-label'>Card Details</label>
            <div className='border rounded p-3 bg-light'>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                      backgroundColor: 'transparent',
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={!stripe || processing}
            className='btn btn-primary w-100 py-3'
          >
            {processing ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                  aria-hidden='true'
                ></span>
                Processing...
              </>
            ) : (
              `Pay $${order.ticket.price}`
            )}
          </button>

          {error && (
            <div className='alert alert-danger mt-3'>
              <i className='bi bi-exclamation-triangle me-2'></i>
              {error}
            </div>
          )}

          {otherErrors.length > 0 && (
            <div className='alert alert-danger mt-3'>
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

        <div className='mt-4 text-center'>
          <small className='text-muted'>
            <i className='bi bi-shield-lock me-1'></i>
            Your payment is secure and encrypted
          </small>
        </div>
      </div>
    </div>
  );
};

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let timerId = null;
    let isMounted = true;

    const initialTimeLeft = Math.round((new Date(order.expiresAt) - new Date()) / 1000);
    if (isMounted) {
      setTimeLeft(initialTimeLeft);
    }

    if (initialTimeLeft > 0) {
      timerId = setInterval(() => {
        if (!isMounted) return;

        setTimeLeft((currentTimeLeft) => {
          const newTimeLeft = currentTimeLeft - 1;
          if (newTimeLeft < 0) {
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
            return -1;
          }
          return newTimeLeft;
        });
      }, 1000);
    } else {
      setTimeLeft(-1);
    }

    return () => {
      isMounted = false;
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    };
  }, [order.expiresAt]);

  if (timeLeft < 0) {
    return (
      <ContentContainer>
        <div className='text-center'>
          <h1 className='mb-4'>Purchasing {order.ticket.title}</h1>
          <div className='alert alert-warning'>
            <h4 className='mb-0'>Order expired</h4>
          </div>
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <div className='row justify-content-center'>
        <div className='col-md-8'>
          <div className='text-center mb-4'>
            <h1>Purchasing {order.ticket.title}</h1>
            <div className='alert alert-info'>
              <h4 className='mb-0'>Remaining time: {timeLeft} seconds</h4>
            </div>
          </div>
          <Elements stripe={stripePromise}>
            <CheckoutForm
              order={order}
              currentUser={currentUser}
              onSuccess={() => router.push('/orders')}
            />
          </Elements>
        </div>
      </div>
    </ContentContainer>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
