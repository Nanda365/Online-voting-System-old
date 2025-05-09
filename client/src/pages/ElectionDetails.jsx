import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ElectionCandidate from '../components/ElectionCandidate';
import { IoAddOutline } from 'react-icons/io5';
import { UiActions } from '../store/ui-slice';
import { useDispatch, useSelector } from 'react-redux';
import AddCandidateModel from '../components/AddCandidateModel';
import axios from 'axios';
import { voteActions } from '../store/vote-slice';

const ElectionDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [election, setElection] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentVoter = useSelector(state => state?.vote?.currentVoter);
  const addCandidateModelShowing = useSelector(state => state.ui.addCandidateModelShowing);
  const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);

  // Fetch Election, Candidates, and Voters
  const fetchElectionData = async () => {
    setIsLoading(true);
    try {
      const [electionRes, candidatesRes, votersRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}/candidates`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}/voters`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log('Election Data:', electionRes.data);
      console.log('Candidates Data:', candidatesRes.data);
      console.log('Voters Data:', votersRes.data);

      setElection(electionRes.data);
      setCandidates(candidatesRes.data);
      setVoters(votersRes.data || []); 
      dispatch(voteActions.setCandidates(candidatesRes.data));
    } catch (error) {
      console.error('Error fetching election data:', error);
      navigate('/elections');
    }
    setIsLoading(false);
  };

  
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    if (id) {
      fetchElectionData();
    }
  }, []);

  
  const deleteElection = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/elections/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/elections');
    } catch (error) {
      console.log(error);
    }
  };

  const openModel = () => {
    dispatch(UiActions.openAddCandidateModel());
    dispatch(voteActions.changeAddCandidateElectionId(id));
  };

  const formatVoteTime = (timestamp) => {
    if (!timestamp) return 'Not voted yet';
    return new Date(timestamp).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <>
      <section className="electionDetails">
        <div className="container electionDetails_container">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="title"><p>Election Details</p></div>
              <h2>{election.title}</h2>
              <p>{election.description}</p>
              <div className="electionDetails_image">
                <img src={election.thumbnail} alt={election.title} />
              </div>
              <menu className="electionDetails_candidates">
                {candidates.length > 0 ? (
                  candidates.map((candidate) => (
                    <ElectionCandidate key={candidate._id} {...candidate} />
                  ))
                ) : (
                  <p>No candidates yet.</p>
                )}
                {isAdmin && (
                  <button className="add_candidate-btn" onClick={openModel}>
                    <IoAddOutline />
                  </button>
                )}
              </menu>

              {isAdmin && (
                <menu className="voters">
                  <h2>Voters</h2>
                  <table className="voters_table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Email Address</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {console.log("Voter Data in Table:", voters)}
                      {voters
                        .filter(voter => isAdmin || voter._id === currentVoter?._id)
                        .map((voter) => (
                          <tr key={voter._id}>
                            <td>
                              <h5>{voter.fullName}</h5>
                            </td>
                            <td>{voter.email}</td>
                            <td>{formatVoteTime(voter.votedAt || voter.createdAt)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </menu>
              )}

              {isAdmin && (
                <button className="btn danger full" onClick={deleteElection}>
                  Delete Election
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {addCandidateModelShowing && <AddCandidateModel />}
    </>
  );
};

export default ElectionDetails;
