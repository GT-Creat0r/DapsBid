import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context";

import { CustomButton, FormField, Loader } from "../components";
import { errorCodes } from '../utils';

// TODO: If possible, make sure the user can vote for the election if there is a unique identifier for the voter which can be stored in mongodb or such
// TODO: To make sure the user is correctly voting for the election, make sure to input the unique voter identifier whilst creating the election in CreateElection page.
// TOOD: Can implement a feature where the election's voter unique identifier is checked before casting the vote.

const CastVote = () => {
  const navigate = useNavigate();
  const { registerVote } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    electionName: '',
    electionPassPhrase: '',
    candidateIndex: '',
  });
  const [electionName, setElectionName] = useState('')
  const [passPhrase, setPassPhrase] = useState('')
  const [candidateIndex, setCandidateIndex] = useState(0)

  const handleFormChangeField = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setElectionName(form.electionName);
    setPassPhrase(form.electionPassPhrase);
    setCandidateIndex(form.candidateIndex);
    try {
      // await getAllEvents();
      // await displayAllElection();
      await registerVote(electionName, passPhrase, candidateIndex);
      console.info("Call to castVote successful");
    } catch (error) {
      if (error in errorCodes) {
        alert(`Error Code: ${error}. ${errorCodes[error]}`);
        setIsLoading(false);
      }
      console.error("Call to castVote failed from castVote component", error);
      // alert("Call to castVote failed from castVote component");
    }
    setIsLoading(false);
  }

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      { isLoading && <Loader /> }
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilouge font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">Cast Vote</h1>
      </div>
      <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Election Name *"
            placeholder="Enter election name"
            inputType="text"
            value={form.electionName}
            handleChange={ (e) => {
              handleFormChangeField('electionName', e)
            } }
          />
          <FormField 
            labelName="Election Pass Phrase *"
            placeholder="Enter the Passcode for election"
            inputType="password"
            value={form.electionPassPhrase}
            handleChange={ (e) => {
              handleFormChangeField('electionPassPhrase', e)
            } }
          />
        </div>
        <FormField 
            labelName="Candidate Index *"
            placeholder="Enter the Candidate Index"
            inputType="number"
            value={form.candidateIndex}
            handleChange={ (e) => {
              handleFormChangeField('candidateIndex', e)
            } }
          />
        <div className='flex justify-center items-center mt-[40px]'>
            <CustomButton 
              btnType="submit"
              title="Submit"
              styles='bg-[#1dc071]'
            />
          </div>
      </form>
    </div>
  )
}

export default CastVote;
