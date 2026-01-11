import React from 'react'

const Footer = () => {
    return (
        <div className='py-4 mx-auto text-center bg-gray-100 w-full'>
            <p >© All rights reserved. {new Date().getFullYear()}</p>
        </div>
    )
}

export default Footer