import React, { useContext, useEffect } from 'react'
import SignUpForm from '../containers/SignUpForm'
import AuthContext from '../service/AuthContext'
import { useNavigate } from 'react-router-dom'

const SignUpPage = () => {

    const { user } = useContext(AuthContext)

    const navigate = useNavigate()
    useEffect(() => {
        setTimeout(() => {
            if (user) {
                navigate('/development/dashboard')
            }
        }, 1000);
    }, [user])

    return (
        <div className='signup-page'>
            <SignUpForm />
        </div>
    )
}

export default SignUpPage