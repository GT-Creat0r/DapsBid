import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context";

import { money } from "../assets";
import { CustomButton, FormField, Loader } from "../components";
import { checkIfImage, errorCodes } from "../utils";

const CreateElection = () => {
  const navigate = useNavigate();
  const { organizeElection, displayAllElection, getAllEvents, getElectionDetails } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    electionName: '',
    totalCandidate: '',
    electionDurationInMinutes: '',
    electionPassPhrase: '',
    electionDescription: '',
    electionImage: '',
  });
  // const [electionDetail, setElectionDetail] = useState([]);

  const handleFormChangeField = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    checkIfImage(form.electionImage, async (exists) => {
      if (exists) {
        try {
          await organizeElection({ ...form });
          console.info("Call to organizeElection successful");
          navigate('/profile');
          setIsLoading(false);
        } catch (error) {
          if (error in errorCodes) {
            alert(`Error Code: ${error}. ${errorCodes[error]}`);
            setIsLoading(false);
          }
          console.log("Call to organizeElection failed", error);
          // alert("Call to organizeElection failed");
          /* if (error == 1){
            alert("ElectionV2__InvalidOrganizer: Please make sure you have registered as an organizer first.");
            setIsLoading(false);
          } */
        }
      } else {
        alert("Please make sure the image url you have provided is valid.");
        setForm({ ...form, electionImage: '' });
      }
    });
    // await getAllEvents();
    // let electionData = await getElectionDetails()
    // setElectionDetail(electionData);
    // console.log("Election Detail: ", electionDetail);
    // await displayAllElection();

    // TODO: make sure when the address calling the contract has not been registered as an organizer, an alert or some sort of error message is displayed.
    // console.error("Call to organizeElection failed", error);
    // console.log(form);
  }

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      { isLoading && <Loader /> }
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilouge font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">Start an Election</h1>
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
            labelName="Number of Candidates *"
            placeholder="Enter the number of candidates"
            inputType="text"
            value={form.totalCandidate}
            handleChange={ (e) => {
              handleFormChangeField('totalCandidate', e)
            } }
          />
        </div>
        <FormField 
            labelName="Election Duration (in minutes) *"
            placeholder="Enter election duration in minutes"
            inputType="text"
            value={form.electionDurationInMinutes}
            handleChange={ (e) => {
              handleFormChangeField('electionDurationInMinutes', e)
            } }
          />
        <FormField 
          labelName="Election Pass Phrase *"
          placeholder="Enter election pass-phrase"
          inputType="password"
          value={form.electionPassPhrase}
          handleChange={ (e) => {
            handleFormChangeField('electionPassPhrase', e)
          } }
        />
        <div className='w-full flex justify-center items-center p-4 bg-[#674dc5] h-[120px] rounded-[10px]'>
          <img src={money} alt="money" className='w-[40px] h-[40px] object-contain' />
          <h4 className='font-epilouge font-bold text-[25px] text-white ml-[20px] mr-[20px]'>
            Each Vote Matters
          </h4>
          <img src={money} alt="money" className='w-[40px] h-[40px] object-contain' />
        </div>
        <FormField 
          labelName="Election Description *"
          placeholder="Enter the description for election"
          isTextArea
          value={form.electionDescription}
          handleChange={ (e) => {
            handleFormChangeField('electionDescription', e)
          } }
        /> 
        <FormField 
          labelName="Election Image *"
          placeholder="Enter url of image for election"
          inputType="url"
          value={form.electionImage}
          handleChange={ (e) => {
            handleFormChangeField('electionImage', e)
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

export default CreateElection;
