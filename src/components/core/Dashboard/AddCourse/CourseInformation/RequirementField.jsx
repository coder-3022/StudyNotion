import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const RequirementField = ({name, label, register, errors, setValue, getValues}) => {

    const { editCourse, course } = useSelector((state) => state.course)
    const [requirement, setRequirement] = useState("")
    const [requirementsList, setRequirementsList] = useState([])

    useEffect(() => {
        if(editCourse) {
            setRequirementsList(course?.instructions)
        }
        register(name,{
            required: true,
            validate: (value) => value.length > 0
        })
    },[])

    useEffect(() => {
        setValue(name, requirementsList)
    },[requirementsList])

    const handleAddRequirement = () => {
        if(requirement){
            setRequirementsList([...requirementsList,requirement])
            setRequirement("")
        }
        
    }

    const handleRemoveRequirement = (index) => {
        const updatedRequirementList = [...requirementsList]
        updatedRequirementList.splice(index, 1)
        setRequirementsList(updatedRequirementList)
    }

  return (
    <div className='flex flex-col space-y-2'>
        <label className='text-sm text-richblack-5 uppercase tracking-wider' htmlFor={name}>{label}<sup className='text-pink-200'>*</sup></label>
        <div className='flex flex-col items-start space-y-2'>
            <input 
                type='text'
                id={name}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                className='form-style w-full'
            />
            <button
                type='button'
                onClick={handleAddRequirement}
                className=' font-semibold text-yellow-50 uppercase tracking-wider'
            >
                Add
            </button>
        </div>

        {
            requirementsList.length > 0 && (
                <ul className='mt-2 list-inside list-disc'>
                    {
                        requirementsList.map((requirement, index) => (
                            <li key={index} className=' flex items-center text-richblack-5'>
                                <span>{requirement}</span>
                                <button
                                    type='button'
                                    onClick={() => handleRemoveRequirement(index)}
                                    className='ml-2 text-xs text-pure-greys-300'
                                >
                                    clear
                                </button>
                            </li>
                        ))
                    }
                </ul>
            )
        }

        {
            errors[name] && (
                <span className='ml-2 text-xs tracking-wide text-pink-200'>{label} is required**</span>
            )
        }
    </div>
  )
}

export default RequirementField
