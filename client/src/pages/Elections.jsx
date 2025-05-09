import React, { useEffect, useState } from 'react'
import Election from '../components/Election'
import AddElectionModel from '../components/AddElectionModel'
import { useDispatch, useSelector } from 'react-redux'
import { UiActions } from '../store/ui-slice'
import UpdateElectionModel from '../components/UpdateElectionModel'
import axios from 'axios'
import Loader from '../components/Loader'
import { useNavigate } from 'react-router-dom'

const Elections = () => {
  const navigate = useNavigate()
  
  
  const [elections, setElections ] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch()


  const opneModel= () => {
    dispatch(UiActions.openElectionModel()); 
  }

  const token = useSelector(state => state?.vote?.currentVoter?.token)
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin)
  const electionModelShowing = useSelector(state => state.ui.electionModelShowing)
  const updateElectionModelShowing = useSelector(state => state.ui.updateElectionModelShowing)
  
  const getElections = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
      setElections(response.data)
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  useEffect (() => {
    getElections()
  },[])





  return (
    <>
      <section className="elections">
        <div className="container elections_container">
          <header className="elections_header">
            <h1>Ongoing Elections</h1>
            {isAdmin && <button className='btn primary' onClick={opneModel}>Create New Election</button> }
          </header>
          {isLoading ? <Loader/> : <menu className="elections_menu">
            {
              elections.map(election => <Election key={election._id} {...election} />)
            }
          </menu>}
        </div>
      </section>
      
      {electionModelShowing && <AddElectionModel />}
      {updateElectionModelShowing && <UpdateElectionModel />}
    </>
  )
}

export default Elections

