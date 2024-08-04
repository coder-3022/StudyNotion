import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {AiOutlineEyeInvisible,AiOutlineEye} from 'react-icons/ai'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'


import { sendOtp } from '../../../services/operations/authAPI'
import { setSignupData } from '../../../slices/authSlice'
import { ACCOUNT_TYPE } from '../../../utils/constants'
import Tab from '../../common/Tab'


const SignupForm = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT)

    const [formData, setFromData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    const[showPassword,setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const {firstName,lastName,email,password,confirmPassword} =formData

    const handleOnChange = (e) => {
        setFromData( (prevData) => ({...prevData, [e.target.name]:e.target.value}))
    }

    const handleOnSubmit = (e) =>{
        e.preventDefault();
        if(password !== confirmPassword){
            toast.error("Passwords do not match");
            return;
        }
        const signupData= {...formData, accountType};
        dispatch(setSignupData(signupData))
        dispatch(sendOtp(formData.email,navigate))
        setFromData({
            firstName:"",
            lastName:"",
            email:"",
            password:"",
            confirmPassword:"",
        })
        setAccountType(ACCOUNT_TYPE.STUDENT)
    }

    // data to pass to tab component
    const tabData = [
        {
            id:1,
            tabName:"Student",
            type:ACCOUNT_TYPE.STUDENT,
        },
        {
            id:2,
            tabName: "Instructor",
            type: ACCOUNT_TYPE.INSTRUCTOR,
        },
    ]

  return (
    <div>
        {/* Tab */}
        <Tab tabData= {tabData} field={accountType} setField={setAccountType}/>

        {/* Form */}

        <form onSubmit={handleOnSubmit} className=' flex w-full flex-col gap-y-4'>

            <div className=' flex gap-x-4'>
                <label>   
                    <p className=' mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        First Name 
                        <sup className=' text-pink-200'>*</sup>
                    </p>
                    <input type="text"
                        required
                        value={firstName}
                        onChange={handleOnChange}
                        placeholder='Enter First Name'
                        name='firstName'
                        style={{boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
                        className='form-style w-full '
                    />
                </label>

                <label>   
                    <p className=' mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        Last Name 
                        <sup className=' text-pink-200'>*</sup>
                    </p>
                    <input type="text"
                        required
                        value={lastName}
                        onChange={handleOnChange}
                        placeholder='Enter Last Name'
                        name='lastName'
                        style={{boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
                        className=' form-style w-full'
                    />
                </label>
            </div>

            <label className=' w-full'>
                <p className=' mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                    Email Address 
                    <sup className=' text-pink-200'>*</sup>
                </p>
                <input type="email"
                    required
                    value={email}
                    onChange={handleOnChange}
                    placeholder='Enter Email'
                    name='email'
                    style={{boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
                    className=' form-style w-full'
                />
                
            </label>

            <div className=' flex gap-x-4'>
                <label className=' relative'>   
                    <p className=' mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        Create Password 
                        <sup className=' text-pink-200'>*</sup>
                    </p>
                    <input type={showPassword ? ("text") : ("password")}
                        required
                        value={password}
                        onChange={handleOnChange}
                        placeholder='Enter Password'
                        name='password'
                        style={{boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)" }}
                        className=' form-style w-full !pr-10'
                    />

                    <span className=' absolute right-3 top-[38px] z-[10] cursor-pointer'
                        onClick={() => setShowPassword((prev) => !prev)}>
                            {
                                showPassword ? (<AiOutlineEyeInvisible fontSize= {24} fill ="#AFB2BF" />) 
                                : (<AiOutlineEye fontSize= {24} fill ="#AFB2BF" />)
                            }
                    </span>

                </label>

                <label className=' relative'>   
                    <p className=' mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5'>
                        Confirm Password 
                        <sup className=' text-pink-200'>*</sup>
                    </p>
                    <input type={showConfirmPassword ? ("text") : ("password")}
                        required
                        value={confirmPassword}
                        onChange={handleOnChange}
                        placeholder='Confirm Password'
                        name='confirmPassword'
                        className='form-style w-full !pr-10'
                    />

                    <span className=' absolute right-3 top-[38px] z-[10] cursor-pointer'
                        onClick={() => setShowConfirmPassword((prev) => !prev)}>
                            {
                                showConfirmPassword ? (<AiOutlineEyeInvisible fontSize= {24} fill ="#AFB2BF" />) 
                                : (<AiOutlineEye fontSize= {24} fill ="#AFB2BF" />)
                            }
                    </span>

                </label>
            </div>

            <button type='submit'
            className=' bg-yellow-50 rounded-[8px] font-medium
            text-richblack-900 px-[12px] py-[8px] mt-6'>
                Create Account
            </button>


        </form>


    </div>
  )
}

export default SignupForm
