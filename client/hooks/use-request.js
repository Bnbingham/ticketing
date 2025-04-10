import { useState } from 'react';
import axios from 'axios';

export const useRequest = ({ url, method, body, onSuccess }) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [otherErrors, setOtherErrors] = useState([]);

  const doRequest = async (props = {}) => {
    setFieldErrors({});
    setOtherErrors([]);
    try {
      const response = await axios[method](url, { ...body, ...props });
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      const { errors } = err?.response?.data || {};
      if (!errors) {
        setOtherErrors([err.message]);
        return;
      }
      const fieldErrors = errors
        .filter((error) => error.field)
        .reduce((acc, error) => {
          acc[error.field] = error.message;
          return acc;
        }, {});
      const otherErrors = errors.filter((error) => !error.field).map((error) => error.message);
      setFieldErrors(fieldErrors);
      setOtherErrors(otherErrors);
    }
  };

  return { doRequest, fieldErrors, otherErrors, setFieldErrors, setOtherErrors };
};

export default useRequest;
