import React from 'react'

const FormField = ({ labelName, placeholder, inputType, isTextArea, value, handleChange }) => {
  return (
    <label className='flex-1 w-full flex flex-col'>
        { labelName && (
            <span className='font-epilouge font-medium text-[14px] leading-[22px] text-[#808191] mb-[10px]'>{labelName}</span>
        ) }
        { isTextArea ? (
            <textarea 
            // required
            value={value}
            onChange={handleChange}
            type={inputType}
            rows={10}
            placeholder={placeholder}
            className='py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilouge text-white texxt-[14px] placeholder:text-[#4b5264] rounded-[10px] sm:min-w-[300wpx]'
            />
        ) : (
            <input 
                required
                value={value}
                onChange={handleChange}
                type={inputType}
                step="1"
                placeholder={placeholder}
                className='py-[15px] sm:px-[25px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilouge text-white texxt-[14px] placeholder:text-[#4b5264] rounded-[10px] sm:min-w-[300wpx]'
            />
        ) }
    </label>
  )
}

export default FormField;