import 'bootstrap/dist/css/bootstrap.min.css';
import buildClient from '../api/build-client';
import { Header } from '../components/header';
export const AppContainer = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component
        {...pageProps}
        currentUser={currentUser}
      />
    </div>
  );
};

AppContainer.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  const pageProps = appContext.Component.getInitialProps
    ? await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)
    : {};

  return { pageProps, ...data };
};

export default AppContainer;
