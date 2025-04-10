import ContentContainer from '../../components/content-container';
import Link from 'next/link';

const OrdersIndex = ({ orders }) => {
  const orderList = orders.map((order) => (
    <div
      key={order.id}
      className='card mb-3'
    >
      <div className='card-body'>
        <div className='d-flex justify-content-between align-items-center'>
          <div>
            <h5 className='card-title mb-1'>{order.ticket.title}</h5>
            <div className='d-flex align-items-center'>
              <span className='text-muted me-3'>${order.ticket.price}</span>
              <span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
            </div>
          </div>
          <Link
            href={`/orders/${order.id}`}
            className='btn btn-outline-primary'
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
            <h1>My Orders</h1>
            <p className='text-muted'>View and manage your ticket orders</p>
          </div>

          {orders.length === 0 ? (
            <div className='alert alert-info'>
              <i className='bi bi-info-circle me-2'></i>
              You haven't placed any orders yet.
            </div>
          ) : (
            orderList
          )}
        </div>
      </div>
    </ContentContainer>
  );
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'created':
      return 'bg-primary';
    case 'cancelled':
      return 'bg-danger';
    case 'complete':
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};

OrdersIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');
  return { orders: data };
};

export default OrdersIndex;
