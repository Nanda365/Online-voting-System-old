import React, { useEffect, useState } from 'react';
import ResultElection from '../components/ResultElection';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Results = () => {
  const [elections, setElections] = useState([]);
  const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);

  const getElections = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/elections`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setElections(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getElections();
  }, []);

  return (
    <section className='results'>
      <div className='container results_container'>
        {isAdmin ? (
          elections.map(election => <ResultElection key={election._id} {...election} />)
        ) : (
          <h2>You do not have permission to view the results.</h2>
        )}
      </div>
    </section>
  );
};

export default Results;
