import ContentContainer from '../../components/content-container';
import { useState } from 'react';
import { useRouter } from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ ticket }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { doRequest, fieldErrors, otherErrors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: { ticketId: ticket.id },
    onSuccess: (order) => {
      router.push('/orders/[orderId]', `/orders/${order.id}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await doRequest();
    setIsSubmitting(false);
  };

  return (
    <ContentContainer>
      <div className='row justify-content-center'>
        <div className='col-md-8'>
          <div className='card'>
            <div className='card-body'>
              <h1 className='card-title text-center mb-4'>{ticket.title}</h1>

              <div className='mb-4'>
                <div className='d-flex justify-content-between mb-2'>
                  <span className='text-muted'>Price:</span>
                  <span className='fw-bold'>${ticket.price}</span>
                </div>
                <div className='d-flex justify-content-between mb-2'>
                  <span className='text-muted'>Status:</span>
                  <span className={`badge ${ticket.orderId ? 'bg-warning' : 'bg-success'}`}>
                    {ticket.orderId ? 'Reserved' : 'Available'}
                  </span>
                </div>
              </div>

              {otherErrors.length > 0 && (
                <div className='alert alert-danger'>
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

              <button
                className='btn btn-primary w-100 py-3'
                onClick={handleSubmit}
                disabled={isSubmitting || ticket.orderId}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                      aria-hidden='true'
                    ></span>
                    Processing...
                  </>
                ) : ticket.orderId ? (
                  'Ticket Reserved'
                ) : (
                  'Purchase Ticket'
                )}
              </button>

              {ticket.orderId && (
                <div className='alert alert-warning mt-3'>
                  <i className='bi bi-exclamation-circle me-2'></i>
                  This ticket has already been reserved by another user.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};

export default TicketShow;
