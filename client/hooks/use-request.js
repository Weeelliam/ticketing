import axios from 'axios';
import { useState } from 'react';

const useRequest = ({ url, method, body, onSucces }) => {
  //method should be post, put, get, patch..
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, 
        {...body, ...props});
      if (onSucces) {
        onSucces(response.data);
      }

      return response.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Oopsie..</h4>
          <ul className="my-0">
            {err.response.data.error.map((e) => {
              return <li key={e.message}>{e.message}</li>;
            })}
          </ul>
        </div>
      );
    }
  };
  return { doRequest, errors };
};

export default useRequest;
