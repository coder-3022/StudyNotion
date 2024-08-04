import React from 'react'

const IconBtn = ({
    text,
    onclick,
    children,
    disabled,
    outline=false,
    customClasses,
    type,
}) => {
  return (
   <div className='text-white'>
        <button
            className={` ${customClasses} rounded-md py-1 px-2 font-semibold text-richblack-900 uppercase tracking-wider
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            ${outline ? 'border border-yellow-50 bg-transparent' : 'bg-yellow-50'}
            `}
            disabled={disabled}
            onClick={onclick}
            type={type}
        >
            {
                children ? (
                    <div className={`flex items-center gap-x-2 ${outline && "text-yellow-50"}`}>
                        {text}
                        {children}
                    </div>
                ) : (<div>{text}</div>)
            }
            
        </button>
   </div>
  )
}

export default IconBtn
