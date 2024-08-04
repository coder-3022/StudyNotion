import React from 'react'
import { FaCheck } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import CourseInformationForm from './CourseInformation/CourseInformationForm'
import CourseBuilderForm from './CourseBuilder/CourseBuilderForm'
import PublishCourse from './PublishCourse'

const RenderSteps = () => {

    const {step} = useSelector( (state) => state.course);
    const steps = [
        {
            id:1,
            title:"Course Information",
        },
        {
            id:2,
            title:"Course Builder",
        },
        {
            id:3,
            title:"Publish",
        },
    ]
  return (
    <>
        <div className='relative mb-2 flex w-full justify-center'>
            {steps.map( (item) => (
                <fragment key={item.id}>
                    <div className={`grid cursor-default aspect-square w-[34px] place-items-center rounded-full border-[1px]
                        ${step === item.id && "bg-yellow-900 border-yellow-50 text-yellow-50"} 
                        ${step< item.id && "border-richblack-700 bg-richblack-800 text-richblack-300"}
                        // it insert yellow tick sign when we complete fillup of any id so we goes to next step and item.id < step
                        ${step > item.id && "bg-yellow-50 text-yellow-50"} `}>

                        {
                            step > item.id ? (<FaCheck className='font-bold text-richblack-900' />) : (item.id)
                        }

                    </div>
                
                    {
                        //code for dashes between the label
                        item.id !== steps.length && (
                            <>
                                <div className={`h-[calc(34px/2)] w-[33%]  border-dashed border-b-2 ${step > item.id  ? "border-yellow-50" : "border-richblack-500"} `}>
                                </div>
                            </>
                        )
                    }
                </fragment>
            ))}
        </div>

        <div className='mb-10 md:mb-16'>
            <div className='hidden md:flex justify-between select-none ' >
                {steps.map( (item) => (
                    <div className={`min-w-[130px] text-center text-sm uppercase tracking-wider
                            ${step >= item.id ? 'text-richblack-5' : 'text-richblack-500'}
                        `}
                        key={item.id}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
        </div>

        {/* Render specific component based on current step */}
        
        <div className='md:hidden font-semibold mb-5 text-xl'>
            {step === 1 && "CourseInformationForm"}
            {step === 2 && "CourseBuilderForm"}
            {step === 3 && "PublishCourse"}
        </div>

        {step === 1 && <CourseInformationForm/>}
        {step === 2 && <CourseBuilderForm/>}
        {step === 3 && <PublishCourse/>} 
    </>
  )
}

export default RenderSteps

