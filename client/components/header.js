import Link from 'next/link';

export const Header = ({ currentUser }) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup', icon: 'bi-person-plus' },
    !currentUser && { label: 'Sign In', href: '/auth/signin', icon: 'bi-box-arrow-in-right' },
    currentUser && { label: 'Sell Tickets', href: '/tickets/new', icon: 'bi-ticket-perforated' },
    currentUser && { label: 'My Orders', href: '/orders', icon: 'bi-bag' },
    currentUser && { label: 'Sign Out', href: '/auth/signout', icon: 'bi-box-arrow-right' },
  ].filter(Boolean);

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-primary shadow-sm'>
      <div className='container'>
        <Link
          href='/'
          className='navbar-brand d-flex align-items-center'
        >
          <i className='bi bi-ticket-perforated-fill me-2'></i>
          <span className='fw-bold'>TixGet</span>
        </Link>

        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarNav'
          aria-controls='navbarNav'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>

        <div
          className='collapse navbar-collapse'
          id='navbarNav'
        >
          <ul className='navbar-nav ms-auto'>
            {links.map(({ label, href, icon }) => (
              <li
                key={href}
                className='nav-item'
              >
                <Link
                  href={href}
                  className='nav-link d-flex align-items-center'
                >
                  <i className={`bi ${icon} me-1`}></i>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
