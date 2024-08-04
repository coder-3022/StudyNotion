import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../../services/operations/profileAPI"
import InstructorChart from "./InstructorChart"


export default function Instructor(){

  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)
      if (instructorApiData?.length) setInstructorData(instructorApiData)
      if (result) {
        setCourses(result)
      }
      setLoading(false)
    })()
  }, [])

  const totalAmount = instructorData?.reduce(
    (acc, curr) => acc + curr.totalAmountGenerated,
    0
  )

  const totalStudents = instructorData?.reduce(
    (acc, curr) => acc + curr.totalStudentsEnrolled,
    0
  )

  return (
    
    <div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-richblack-5">  Hi, {user?.firstName} 👋 </h1>
        <p className="font-medium text-richblack-200"> Let's start something new  </p>
      </div>

      {loading ? (
          <div lassName='h-[calc(100vh-10rem)] grid place-items-center'>
              <div className="spinner"></div>
          </div>  
       ) : courses?.length > 0 ? (
        <div>
          <div className='flex flex-col md:flex-row gap-5 my-10'>

            {/* Render chart / graph */}
            <div className='w-full'>
                  {totalAmount > 0 || totalStudents > 0 ? 
                    (<InstructorChart courses={instructorData} />) 
                    : (
                    <div className="flex-1 rounded-md bg-richblack-800 p-6">
                      <p className="text-lg font-bold text-richblack-5">Visualize</p>
                      <p className="mt-4 text-xl font-medium text-richblack-50"> Not Enough Data To Visualize  </p>
                    </div>
                  )}

            </div>

            {/* Total Statistics */}
            <div className='min-h-fit min-w-[250px] rounded-md bg-richblack-800 p-6'>

              <p className='text-lg font-bold text-richblack-5'>Statistics</p>
              <div className='flex flex-col gap-4 mt-4 mb-4'>
                <div>
                  <p className="text-lg text-richblack-200">Total Courses</p>
                  <p className="text-3xl font-semibold text-richblack-50">{courses?.length}</p>
                </div>
                <div>
                  <p className="text-lg text-richblack-200">Total Students</p>
                  <p className="text-3xl font-semibold text-richblack-50">{totalStudents} </p>
                </div>
                <div>
                  <p className="text-lg text-richblack-200">Total Income</p>
                  <p className="text-3xl font-semibold text-richblack-50"> Rs. {totalAmount} </p>
                </div>
              </div>

            </div>

          </div>

          <div className='w-full rounded-md bg-richblack-800 p-6'>
            {/* Render 3 courses */}
            <div className='flex items-center justify-between'>
              <p className='text-lg font-bold text-richblack-5'>Your Courses</p>
              <Link to="/dashboard/my-courses">
                <p className='text-xs font-semibold text-yellow-50'>View All</p>
              </Link>
            </div>

            <div className='flex flex-col md:flex-row gap-x-5 gap-y-7 my-4'>
              {courses?.slice(0, 3).map((course) => (
                <div key={course._id} className='md:w-1/3 w-full'>

                  <img src={course?.thumbnail} alt={course?.courseName} className='h-[201px] w-full rounded-md object-cover'/>
                  <p className='mt-3 text-sm font-medium text-richblack-50'> {course?.courseName} </p>
                  <p className='mt-1 text-xs font-medium text-richblack-300'>{course?.studentsEnroled?.length} students | ₹ {course?.price}</p>

                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='text-center mt-20 bg-richblack-800 px-6  py-20 rounded-md'>
          <p className='text-2xl font-bold text-richblack-5'> You have <span className='font-extrabold text-pink-50'>not</span> published any courses yet</p> 
          <Link to="/dashboard/add-course">
            <p className='mt-3 text-lg font-semibold text-yellow-50 underline'> Create a course </p> 
          </Link>
        </div>
      )}

    </div>
  
)}
