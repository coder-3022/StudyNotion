import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { updateProfile } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../common/IconBtn"

const genders = ["Male", "Female", "Prefer not to say", "Other"]


export default function EditProfile() {

  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

    const { 
        register,  
        handleSubmit,
        formState: { errors }, 
    } = useForm()
    
  const submitProfileForm = async (data) => {
    try {
      dispatch(updateProfile(token, data))
    } 
    catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }
  
  return (
    <>
      <form onSubmit={handleSubmit(submitProfileForm)}>

        {/* Profile Information */}
        <div className='my-5 rounded-md border border-richblack-700 bg-richblack-800 py-8 px-5 md:px-12'>

          <h1 className='text-lg mb-6 font-semibold text-richblack-5 uppercase tracking-wider'>Profile Information</h1>
        
          <div className='flex flex-col gap-y-6'>
            <div className='flex flex-col md:flex-row gap-5'>

              <label className='w-full'>
                <p className='label-style uppercase tracking-wider mb-1'>First Name <span className='text-pink-100'>*</span></p>
                <input type="text" name="firstName" id="firstName" placeholder="Enter first name" className="form-style w-full" {...register("firstName", { required: true })} defaultValue={user?.firstName} />                      
                {errors.firstName && ( <span className="-mt-1 text-[12px] text-yellow-100"> Please enter your first name. </span> )}
              </label>


              <label className='w-full' >
                <p className='label-style uppercase tracking-wider mb-1' >Last Name <span className='text-pink-100'>*</span></p>
                <input type="text"  name="lastName" id="lastName" placeholder="Enter first name" className="form-style w-full"  {...register("lastName", { required: true })} defaultValue={user?.lastName}  />
                {errors.lastName && ( <span className="-mt-1 text-[12px] text-yellow-100">  Please enter your last name. </span> )}
              </label>

            </div>

            <div className='flex flex-col md:flex-row gap-5'>
              <label className='w-full' >
                <p className='label-style uppercase tracking-wider mb-1' >Date of Birth <span className='text-pink-100'>*</span></p> 
                <input  type="date"  name="dateOfBirth" id="dateOfBirth" className="form-style w-full"
                  max={new Date().toISOString().split("T")[0]}
                  {...register("dateOfBirth", {
                    required: {
                      value: true,
                      message: "Please enter your Date of Birth.",
                    },
                    max: {
                      value: new Date().toISOString().split("T")[0],
                      message: "Date of Birth cannot be in the future.",
                    },
                  })}
                  defaultValue={user?.additionalDetails?.dateOfBirth?.split("T")[0]}
                />
                {errors.dateOfBirth && (<span className="-mt-1 text-[12px] text-yellow-100">  {errors.dateOfBirth.message}</span>)}
              </label>


              <label  className='w-full' >
                <p className='label-style uppercase tracking-wider mb-1' >Gender <span className='text-pink-100'>*</span></p>
                <select type="text"  name="gender"  id="gender" className="form-style" {...register("gender", { required: true })}  defaultValue={user?.additionalDetails?.gender} >
                  {genders.map((ele, i) => {return (<option className='text-richblack-5'key={i} value={ele}> {ele} </option> )})}
                </select>
                {errors.gender && ( <span className="-mt-1 text-[12px] text-yellow-100"> Please enter your Gender.</span> )}
              </label>
            </div>



            <div className='flex flex-col md:flex-row gap-5'>
              <label className='w-full' >
                <p className='label-style uppercase tracking-wider mb-1' >Contact Number <span className='text-pink-100'>*</span></p>  
                <input  type="tel" name="contactNumber"  id="contactNumber"  placeholder="Enter Contact Number"  className="form-style"
                  {...register("contactNumber", {
                    required: {
                      value: true,
                      message: "Please enter your Contact Number.",
                    },
                    maxLength: { value: 12, message: "Invalid Contact Number" },
                    minLength: { value: 10, message: "Invalid Contact Number" },
                  })}
                  defaultValue={user?.additionalDetails?.contactNumber}
                />
                {errors.contactNumber && (<span className="-mt-1 text-[12px] text-yellow-100">  {errors.contactNumber.message}  </span>  )}
            
              </label>


              <label className='w-full' >
                <p className='label-style uppercase tracking-wider mb-1' >About <span className='text-pink-100'>*</span></p> 
                <input  type="text"  name="about"  id="about"  placeholder="Enter Bio Details"  className="form-style"
                  {...register("about", { required: true })}
                  defaultValue={user?.additionalDetails?.about}
                />
                {errors.about && (<span className="-mt-1 text-[12px] text-yellow-100"> Please enter your About. </span>)}
              </label>
            </div>

          </div>

        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => {navigate("/dashboard/my-profile") }} className='rounded-md bg-richblack-700 lg:py-2 py-1 lg:px-5 px-2 font-semibold text-richblack-50 uppercase tracking-wider' >
            Cancel
          </button>
          <IconBtn type="submit" text="Save" customClasses='lg:py-2 lg:px-5' />
        </div>
      
      </form>
    </>
  
)}
