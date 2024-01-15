import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context';

import { CustomButton, FormField, Loader } from '../components';
import { errorCodes } from '../utils';

const RegisterOrganizer = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { setOrganizer } = useStateContext();
    const [form, setForm] = useState({
        address: '',
        voterList: ''
    });

    const handleFormChangeField = (fieldName, e) => {
        setForm({ ...form, [fieldName]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await setOrganizer({ ...form });
            setIsLoading(false);
            navigate('/');
            console.info("Call to setOrganizer successful");
        } catch (error) {
            if (error in errorCodes) {
                alert(`Error Code: ${error}. ${errorCodes[error]}`);
                setIsLoading(false);
            }
            // console.log("Call to setOrganizer failed. Called from ./pages directory", error);
            // alert("Call to setOrganizer failed");
        }
        // console.log(form);
    }

    return (
        <div className='bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4'>
            { isLoading && <Loader /> }
            <div className='flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]'>
                <h1 className='font-epilouge font-bold sm:text-[25px] text-[18px] leading-[38px] text-white'>Register Organizer</h1>
            </div>
            <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
                <div className="flex sm:flex-wrap flex-col gap-[40px]">
                    <FormField 
                        labelName="Organizer Wallet Address *"
                        placeholder="Enter Organizer's wallet Address"
                        inputType="text"
                        value={form.address}
                        handleChange={ (e) => {
                            handleFormChangeField('address', e)
                        } }
                    />
                    <FormField 
                        labelName="Voter Identifier *"
                        placeholder="Enter the Number of candidates"
                        isTextArea
                        value={form.voterList}
                        handleChange={ (e) => {
                            handleFormChangeField('voterList', e)
                        } }
                    />
                </div>
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

export default RegisterOrganizer;