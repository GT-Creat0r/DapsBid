import React from 'react';
import { useNavigate } from 'react-router-dom';

import { loader } from '../assets';
import { ElectionCard } from '../components';

const DisplayElection = ({ isLoading, activeElectionDetail, pastElectionDetail, activeElectionCount, pastElectionCount, isProfile }) => {
    const navigate = useNavigate();

    const handleNavigate = (election) => {
      navigate(`/election-details/${election.id}`, {state: election});
    }

    return (
        <div>
            <h1 className='font-epilouge font-semibold text-[18px] text-white text-left'>Active Elections ({activeElectionCount})</h1>
            <div className='flex flex-wrap mt-[20px] gap-[26px]'>
                { isLoading && (
                    <img src={loader} alt="loader" className='w-[100px] h-[100px] object-contain' />
                ) }

                { !isLoading && activeElectionDetail.length === 0 && isProfile && (
                    <p className='font-epilouge font-semibold text-[14px] leading-[30px] text-[#818183]'>
                        User does not have any active elections running right now.
                    </p>    
                ) }

                { !isLoading && activeElectionDetail.length === 0 && !isProfile && (
                    <p className='font-epilouge font-semibold text-[14px] leading-[30px] text-[#818183]'>
                        No active elections currently.
                    </p>    
                ) }

                { !isLoading && activeElectionDetail.length > 0 && activeElectionDetail.map((election) => (<ElectionCard key={election.id} {...election} handleClick={()=> handleNavigate(election)} />)) }
            </div>
            <h1 className='font-epilouge font-semibold text-[18px] text-white text-left mt-[12px]'>Past Elections ({pastElectionCount})</h1>
            <div className='flex flex-wrap mt-[20px] gap-[26px]'>
                { isLoading && (
                    <img src={loader} alt="loader" className='w-[100px] h-[100px] object-contain' />
                ) }

                { !isLoading && pastElectionCount === 0 && isProfile && (
                    <p className='font-epilouge font-semibold text-[14px] leading-[30px] text-[#818183]'>
                        User has not conducted any elections in the past.
                    </p>    
                ) }

                { !isLoading && pastElectionCount === 0 && !isProfile && (
                    <p className='font-epilouge font-semibold text-[14px] leading-[30px] text-[#818183]'>
                        No election has been created yet.
                    </p>    
                ) }

                { !isLoading && pastElectionCount > 0 && pastElectionDetail.map((election) => (<ElectionCard key={election.id} {...election} handleClick={()=> handleNavigate(election)} />)) }
            </div>
        </div>
    )
}

export default DisplayElection;
