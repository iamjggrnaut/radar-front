import React from 'react'

const DashboardFilter = ({ brandNames, changeBrand, defaultValue, setDays }) => {

    const weekAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString('ru')?.split('.').reverse().join('-')
    const twoWeeksAgo = new Date(new Date().setDate(new Date().getDate() - 14)).toLocaleDateString('ru')?.split('.').reverse().join('-')
    const monthAgo = new Date(new Date().setDate(new Date().getDate() - 31)).toLocaleDateString('ru')?.split('.').reverse().join('-')

    return (
        <div className="filter container dash-container p-3 pb-4 pt-0 d-flex">
            <div className="row">
                <div className="filter-item col">
                    <label style={{ fontWeight: 600, marginBottom: '4px ' }} htmlFor="period">Период:</label>
                    <select style={{ padding: '1vh 1.75vh', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: '8px' }} className='form-control' id="period"
                        defaultValue={'14'}
                        onChange={e => { setDays(e.target.value) }}
                    >
                        <option selected={defaultValue === 1 ? true : false} value={'1'}>1 день</option>
                        <option selected={defaultValue === 7 ? true : false} value={'7'}>7 дней</option>
                        <option selected={defaultValue === 14 ? true : false} value={'14'}>14 дней</option>
                        <option selected={defaultValue === 30 ? true : false} value={'30'}>30 дней</option>
                        <option selected={defaultValue === 92 ? true : false} value={'92'}>90 дней</option>
                    </select>
                    <svg style={{ position: 'absolute', right: '1.75vw', top: '5.5vh', width: '1.5vh', }} viewBox="0 0 28 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2L14 14L26 2" stroke="rgba(140, 140, 140, 1)" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
                {/* <div className="filter-item col">
                    <label style={{ fontWeight: 600, marginBottom: '4px ' }} htmlFor="marketplace">Маркетплейс:</label>
                    <select style={{padding: '1vh 1.75vh'}} className='form-control' id="marketplace" disabled>
                        <option value="amazon" style={{ opacity: 0.8 }}>Не выбрано</option>
                        <option value="amazon">Wildberries</option>
                    </select>
                    <svg style={{ position: 'absolute', right: '1.75vw', top: '5.5vh', width: '1.5vh', }} viewBox="0 0 28 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2L14 14L26 2" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div> */}
                <div className="filter-item col">
                    <label style={{ fontWeight: 600, marginBottom: '4px ' }} htmlFor="store">Магазин:</label>
                    <select style={{ padding: '1vh 1.75vh', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: '8px' }} className='form-control' id="store" defaultValue={brandNames ? brandNames[0] : null} onChange={e => changeBrand(e.target.value)}>
                        {
                            brandNames && brandNames.map((brand, i) => (
                                <option key={i} value={brand}>{brand}</option>
                            ))
                        }
                        {/* <option value="store1">Магазин 1</option>
                    <option value="store2">Магазин 2</option>
                    <option value="store3">Магазин 3</option> */}
                    </select>
                    <svg style={{ position: 'absolute', right: '1.75vw', top: '5.5vh', width: '1.5vh', }} viewBox="0 0 28 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2L14 14L26 2" stroke="rgba(140, 140, 140, 1)" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div>
                {/* <div className="filter-item col-2 me-2">
                    <label style={{ fontWeight: 600, marginBottom: '4px ' }} htmlFor="brand">Бренд:</label>
                    <select className='form-control' id="brand" disabled>
                        <option value="brand1">Не выбрано</option>
                        <option value="brand2">Бренд 2</option>
                        <option value="brand3">Бренд 3</option>
                    </select>
                    <svg style={{ position: 'absolute', right: '1.5vw', top: '5.25vh', width: '1.5vh', }} viewBox="0 0 28 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2L14 14L26 2" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                </div> */}
            </div>
        </div>
    )
}

export default DashboardFilter