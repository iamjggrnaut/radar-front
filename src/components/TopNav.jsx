import React, { useContext, useState } from 'react'
import AuthContext from '../service/AuthContext'
import noticon from '../assets/notification.png'
import question from '../assets/question.png'
import settings from '../assets/settings.png'



const TopNav = ({ title }) => {

    const { user, logout } = useContext(AuthContext)

    const [menuShown, setMenuShown] = useState(false)

    return (
        <div className='top-nav'>
            <div className="container d-flex align-items-center justify-content-between">
                <div className='d-flex col me-2'>
                    {
                        !title ?
                            <>
                                <span className='me-3'>{`${user?.firstName} ${user?.lastName}`}</span>
                                <span>{user?.email}</span>
                            </>
                            :
                            <p style={{ fontSize: 24, fontWeight: 700 }} className='m-0 p-0 fw-bold'>{title}</p>
                    }
                </div>
                <div className="col-2 d-flex justify-content-around top-menu">
                    {/* <img src={noticon} alt="" style={{ maxWidth: '24px', cursor: 'pointer' }} />
                    <img src={question} alt="" style={{ maxWidth: '24px', cursor: 'pointer' }} /> */}
                    <img src={settings} alt="" style={{ maxWidth: '24px', cursor: 'pointer' }}
                        onClick={() => setMenuShown(!menuShown)}
                    />
                    {
                        menuShown ?
                            <div className='settings-modal'>
                                <a href="#" className='link'
                                    style={{
                                        borderBottom: '1px  solid silver',
                                        paddingBottom: '8px',
                                    }}
                                >
                                    Получить полный доступ
                                </a>
                                <p className='mt-3 mb-2'>Сотрудники</p>
                                <p className='mb-2'>Настройки аккаунта</p>
                                <p className='mb-2'>Подключенный магазины</p>
                                <p className='mb-2'>Экспорт отчетов</p>
                                <p className='mb-2'>Тарифы</p>
                                <hr style={{ minWidth: '220px', height: '1px', border: '1px solid silver', marginBottom: '4px' }} />
                                <a href="#" className='link'
                                    style={{
                                        paddingTop: '4px',
                                        width: '240px'
                                    }}
                                    onClick={logout}
                                >
                                    Выход
                                </a>
                            </div> :
                            null
                    }
                </div>
            </div>
        </div>
    )
}

export default TopNav