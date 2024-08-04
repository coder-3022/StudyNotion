import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import {toast} from "react-hot-toast";
import { apiConnector } from '../../services/apiconnector';
import { contactusEndpoint } from '../../services/apis';
import CountryCode from '../../data/countrycode.json'

const ContactUsForm = () => {

    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitSuccessful}
    }= useForm();

    const submitContactForm = async(data) => {
        const toastId = toast.loading("Loading...")
        try {
            setLoading(true);
            const response = await apiConnector("POST",contactusEndpoint.CONTACT_US_API,data);
            setLoading(false);
        }
        catch(error) {
            console.log("Error:", error.message);
        }
        toast.dismiss(toastId)
    }

    useEffect( () => {
        if(isSubmitSuccessful){
            reset({
                email: "",
                firstname : "",
                lastname: "",
                message: "",
                phoneNo: "",
            })
        }
    },[reset, isSubmitSuccessful])


  return (
    <form className='flex flex-col gap-7' 
        onSubmit={handleSubmit(submitContactForm)}
    >

        <div className='flex flex-col gap-5 lg:flex-row'>
                {/* first Name */}
                <div className=' flex flex-col gap-2 lg:w-[48%]'>
                <label htmlFor='firstname'
                    className='lable-style'>
                    First Name
                </label>
                <input type="text" 
                    name='firstname'
                    id='firstname'
                    className='form-style'
                    placeholder='Enter first name'
                    {...register("firstname", {required: true})}

                />
                {
                    errors.firstname && (
                        <span className='-mt-1 text-[12px] text-yellow-100'>
                            Please enter your name
                        </span>
                    )
                }
            </div>

            {/* last Name */}
            <div className='flex flex-col gap-2 lg:w-[48%]'>
                <label htmlFor='lastname'
                    className='lable-style'>
                    Last Name
                </label>
                <input type="text" 
                    name='lastname'
                    id='lastname'
                    className='form-style'
                    placeholder='Enter last name'
                    {...register("lastname")}

                />
                
            </div>

        </div>

        {/* email */}
        <div className='flex flex-col gap-2'>
            <label htmlFor="email"
                className='lable-style'>
                    Email Address
            </label>
            <input type="email"
                name='email'
                id='email'
                className='form-style'
                placeholder='Enter email Address'
                {...register("email",{required:true})}
            />
            {
                errors.email && (
                    <span className='-mt-1 text-[12px] text-yellow-100'>
                        Please enter your email address
                    </span>
                )
            }
        </div>


        {/* phoneNo */}
        <div className='flex flex-col gap-2'>

            <label htmlFor="phonenumber"
                className='lable-style'>
                    Phone Number
            </label>

            <div className='flex gap-5 '>
                <div className='flex w-[81px] flex-col gap-2'>
                    {/* dropdown */}
                    <select 
                        name="dropdown" 
                        id="dropdown" 
                        className='form-style'
                        {...register("countrycode",{required:true})}>

                        {
                            CountryCode.map( (element,index) => {
                                return (
                                    <option key={index} value={element.code} >
                                        {element.code} -{element.country}
                                    </option>
                                )
                            })
                        }
                    </select>

                </div>

                

                <div className='flex w-[calc(100%-90px)] flex-col gap-2'>
                    {/* phone no field */}
                    <input type="number"
                        name='phonenumber'
                        id='phonenumber'
                        placeholder='12345 67890'
                        className='form-style'
                        {...register("phoneNo",
                        {
                            required:{value:true, message:"Please enter Phone Number"},
                            maxLength:{value:12, message:"Invalid Phone Number"},
                            minLength:{value:10, message:"Invalid phone Number"},
                        })}
                    />

                </div>
            </div>
            {
                errors.phoneNo && (
                    <span className='-mt-1 text-[12px] text-yellow-100'>
                        {errors.phoneNo.message}
                    </span>
                )
            }

        </div>

        {/* message */}
        <div className='flex flex-col gap-2'>
            <label htmlFor="message"
            className='lable-style'>
                Message
            </label>
            <textarea name="message"
                id="message" 
                className='form-style'
                cols="30"
                rows="7"
                placeholder='Enter your message here'
                {...register("message",{required:true})}
                
            />
            {
                errors.message && (
                    <span className='-mt-1 text-[12px] text-yellow-100'>
                        Please enter your message.
                    </span>
                )
            }
        </div>

        <button
            disabled = {loading} 
            type='submit'
            className={`rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
            ${ !loading && "transition-all duration-200 hover:scale-95 hover:shadow-none"}  disabled:bg-richblack-500 sm:text-[16px] `}
        >
            Send Message
        </button>

    </form>
  )
}

export default ContactUsForm