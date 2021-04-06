import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // server side!

    return axios.create({
      baseURL: 'http://www.ticketing.simbatique.com/',
      headers: req.headers,
    });
  } else {
    // browser side!
    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
