import axios from 'axios';

export const buildClient = ({ req }) => {
  const onTheServer = typeof window === 'undefined';

  if (onTheServer) {
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req?.headers,
    });
  } else {
    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
