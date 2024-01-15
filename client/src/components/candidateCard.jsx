import React from 'react'


// TODO: Make sure to implement more params that has been added in V2 of the contract
const CandiateCard = ({ candidateAge, candidateIndex, candidateName, candidateParty, candidateVoteCount }) => {
  return (
    <div className='flex flex-row'>
      <h3>Name: {candidateName}</h3>
      <h3>Age: {candidateAge}</h3>
      <h3>Vote Index: {candidateIndex}</h3>
      <h3>Party: {candidateParty}</h3>
      <h3>Vote Got: {candidateVoteCount}</h3>
    </div>
  )
}

export default CandiateCard;