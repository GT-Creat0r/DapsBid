import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useStateContext } from '../context';

import { CustomButton, FormField, Loader } from '../components';
import { checkIfImage, errorCodes } from '../utils';

const AddCandidate = () => {
  const navigate = useNavigate();
  const { registerCandidate } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    electionName: '',
    candidateName: '',
    candidateParty: '',
    candidateAge: '',
    candidateDescription: '',
    candidateImage: '',
  });

  const handleFormChangeField = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    checkIfImage(form.candidateImage, async (exists) => {
      if (exists) {
        try {
          await registerCandidate({ ...form });
          setIsLoading(false);
          console.info("Call to addCandidate successful");
          navigate('/profile');
        } catch (error) {
          if (error in errorCodes) {
            alert(`Error Code: ${error}. ${errorCodes[error]}`);
            setIsLoading(false);
          }
          console.log("Call to addCandidate failed", error);
          alert("Call to addCandidate failed");
        }
      } else {
        alert("Please make sure the image url you have provided is valid.");
        setForm({ ...form, candidateImage: '' });
      }
    })
    // TODO: make sure when the address calling the contract has not been registered as an organizer, an alert or some sort of error message is displayed.
  }

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      { console.log("This is a test") } 
      { isLoading && <Loader /> }
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilouge font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">Add a Candidate</h1>
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
            labelName="Candidate Name *"
            placeholder="Enter Candidate Name"
            inputType="text"
            value={form.candidateName}
            handleChange={ (e) => {
              handleFormChangeField('candidateName', e)
            } }
          />
        </div>
        <FormField 
            labelName="Candidate Party *"
            placeholder="Enter Candidate's Party"
            inputType="text"
            value={form.candidateParty}
            handleChange={ (e) => {
              handleFormChangeField('candidateParty', e)
            } }
          />
        <FormField 
          labelName="Candidate Age *"
          placeholder="Enter Candidate's Age"
          inputType="number"
          value={form.candidateAge}
          handleChange={ (e) => {
            handleFormChangeField('candidateAge', e)
          } }
        />
        <FormField 
          labelName="Candidate Description *"
          placeholder="Enter Candidate's Description"
          isTextArea
          value={form.candidateDescription}
          handleChange={ (e) => {
            handleFormChangeField('candidateDescription', e)
          } }
        />
        <FormField 
          labelName="Candidate Image *"
          placeholder="Enter Candidate's Image URL"
          inputType="url"
          value={form.candidateImage}
          handleChange={ (e) => {
            handleFormChangeField('candidateImage', e)
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
  );
}

export default AddCandidate;
