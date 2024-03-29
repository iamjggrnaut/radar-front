import React from 'react'

const SelectField = ({ options, callback, label, required, placeholder, defautlValue }) => {

    return (
        <div className='select-field mb-2'>
            <label htmlFor="">{label}</label>
            <select name="" id="" className='form-control mt-2' defaultValue={defautlValue ? defautlValue : null}
                onChange={callback}
            >
                {
                    options && options.map((item, index) => (
                        <option value={item} key={index}>{item}</option>
                    ))
                }
            </select>
        </div>
    )
}

export default SelectField