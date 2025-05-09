import React, { useEffect, useState } from 'react';
import CandidateRating from '../components/CandidateRating';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from './Loader';

const ResultElection = ({ _id: id, thumbnail, title }) => {
    const [totalVotes, setTotalVotes] = useState(0);
    const [electionCandidates, setElectionCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const token = useSelector(state => state?.vote?.currentVoter?.token);

    const getCandidates = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/elections/${id}/candidates`,
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
            );

            const candidates = response.data || [];
            setElectionCandidates(candidates);

            const total = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
            setTotalVotes(total);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (id) {
            getCandidates();
        }
    }, []); 

    return (
        <>
            {isLoading && <Loader />}
            <article className="result">
                <header className="result_header">
                    <h4>{title}</h4>
                    <div className="result_header-image">
                        <img src={thumbnail} alt={title} />
                    </div>
                </header>
                <ul className="result_list">
                    {electionCandidates.map(candidate => (
                        <CandidateRating 
                            key={candidate._id || candidate.id}
                            {...candidate} 
                            totalVotes={totalVotes} 
                        />
                    ))}
                </ul>
            </article>
        </>
    );
};

export default ResultElection;
