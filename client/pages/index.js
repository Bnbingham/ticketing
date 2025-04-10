import ContentContainer from '../components/content-container';
import Link from 'next/link';

const LandingPage = ({ tickets }) => {
  const ticketList = tickets.map((ticket) => (
    <div
      key={ticket.id}
      className='card mb-3'
    >
      <div className='card-body'>
        <div className='d-flex justify-content-between align-items-center'>
          <div>
            <h5 className='card-title mb-1'>{ticket.title}</h5>
            <p className='card-text text-muted mb-0'>${ticket.price}</p>
          </div>
          <Link
            href={`/tickets/${ticket.id}`}
            className='btn btn-primary'
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  ));

  return (
    <ContentContainer>
      <div className='row justify-content-center'>
        <div className='col-md-8'>
          <div className='text-center mb-4'>
            <h1>Available Tickets</h1>
            <p className='text-muted'>Browse and purchase tickets for upcoming events</p>
          </div>

          {tickets.length === 0 ? (
            <div className='alert alert-info'>
              <i className='bi bi-info-circle me-2'></i>
              No tickets available at the moment. Check back later!
            </div>
          ) : (
            ticketList
          )}
        </div>
      </div>
    </ContentContainer>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
};

export default LandingPage;
