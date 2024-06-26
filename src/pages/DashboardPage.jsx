import React, { useContext, useEffect, useState } from 'react'
import SideNav from '../components/SideNav'
import TopNav from '../components/TopNav'
import AuthContext from '../service/AuthContext'
import DashboardFilter from '../components/DashboardFilter'
import MediumPlate from '../components/MediumPlate'
import SmallPlate from '../components/SmallPlate'
import BigChart from '../components/BigChart'
import FinanceTable from '../components/FinanceTable'
import StorageTable from '../components/StorageTable'
import ChartTable from '../components/ChartTable'
import WidePlate from '../components/WidePlate'
import { abcAnalysis, filterArrays, formatDate, generateDateList } from '../service/utils'
import { ServiceFunctions } from '../service/serviceFunctions'
import SelfCostWarning from '../components/SelfCostWarning'
import DataCollectionNotification from '../components/DataCollectionNotification'

const DashboardPage = () => {

    const { user, authToken, showMobile } = useContext(AuthContext)


    const [wbData, setWbData] = useState()
    const [days, setDays] = useState(14)


    const [content, setContent] = useState()
    const [state, setState] = useState()

    const [brandNames, setBrandNames] = useState()
    const [activeBrand, setActiveBrand] = useState()
    useEffect(() => {
        if (user) {
            ServiceFunctions.getBrandNames(user.id).then(data => {
                // let names = [...new Set(data)]
                console.log(data);
                setBrandNames(data)
            })
        }
    }, [user])
    useEffect(() => {
        if (brandNames && brandNames.length) {
            setActiveBrand(brandNames[0])
        }
    }, [brandNames])


    useEffect(() => {
        if (user && activeBrand) {
            ServiceFunctions.getDataCollection(user.id, days, activeBrand).then(data => setWbData(filterArrays(data, days)))
            ServiceFunctions.getDataCollection(user.id, days, activeBrand).then(data => setState(data))
        }
    }, [user, activeBrand])

    useEffect(() => {
        if (wbData) {
            setContent(wbData.content)
        }
    }, [wbData])

    // Заказы
    const orders = wbData && wbData.orders ? wbData.orders.data : []
    // продажи
    const sales = wbData && wbData.sales ? wbData.sales.data : []

    const selfCostArray = sales && state && state.initialCostsAndTax && state.initialCostsAndTax.data ?
        sales.map(item => state.initialCostsAndTax.data.find(el => el.nmID === item.nmId)?.initialCosts) : []

    const selfCost = selfCostArray && selfCostArray.length ? selfCostArray.reduce((acc, item) => acc + item, 0) : 0

    const [reportDaily, setReportDaily] = useState()
    const [reportWeekly, setReportWeekly] = useState()
    const [reportTwoWeeks, setReportTwoWeeks] = useState()
    const [reportMonthly, setReportMonthly] = useState()
    const [reportThreeMonths, setReportThreeMonths] = useState()

    useEffect(() => {
        if (wbData) {
            setReportDaily(wbData.reportDaily?.data?.data?.groups[0]?.statistics)
            setReportWeekly(wbData.reportWeekly?.data?.data?.groups[0]?.statistics)
            setReportTwoWeeks(wbData.reportTwoWeeks?.data?.data?.groups[0]?.statistics)
            setReportMonthly(wbData.reportMonthly?.data?.data?.groups[0]?.statistics)
            setReportThreeMonths(wbData.reportThreeMonths?.data?.data?.groups[0]?.statistics)
        }
    }, [wbData])

    const [curOrders, setCurOrders] = useState()
    useEffect(() => {
        if (days == 1) {
            setCurOrders(reportDaily)
        } else if (days == 7) {
            setCurOrders(reportWeekly)
        } else if (days == 14) {
            setCurOrders(reportTwoWeeks)
        } else if (days == 30) {
            setCurOrders(reportMonthly)
        } else if (days == 92) {
            setCurOrders(reportThreeMonths)
        }
    }, [days, wbData])

    const tax = state && state.initialCostsAndTax ? state.initialCostsAndTax.tax : 0

    const stockAndCostsMatch = wbData && wbData.stocks && state && state.initialCostsAndTax && state.initialCostsAndTax.data ?
        wbData.stocks.data?.map(item => state.initialCostsAndTax.data.find(el => el.nmID === item.nmId)) : []

    const fbo = stockAndCostsMatch?.length && wbData && wbData.stocks ? wbData.stocks.data?.reduce((obj, item) => {
        obj['sum'] = wbData.stocks.data?.reduce((acc, i) => acc + (i.Price * i.quantityFull), 0) || 0
        obj['quantity'] = wbData.stocks.data?.reduce((acc, el) => acc + el.quantityFull, 0) || 0
        obj['initialCosts'] = wbData.stocks.data?.reduce((acc, item) => acc + (stockAndCostsMatch.find(el => el.nmID === item.nmId)?.initialCosts || 0), 0) || 0
        return obj
    }, {}) : null

    const storeData = [
        {
            name: "FBO",
            initialPrice: fbo ? fbo.initialCosts : '0',
            salesPrice: fbo ? fbo.sum : '0',
            quantity: fbo ? fbo.quantity : '0',
        },
        {
            name: "FBS",
            initialPrice: content?.fbo?.fbsAmount * 1000,
            salesPrice: content?.fbo?.fbs,
            quantity: content?.fbo?.fbsAmount || 0,
        },
        {
            name: "Едет к клиенту",
            initialPrice: content?.toClient?.reduce((acc, el) => acc + (el.inWayToClient * stockAndCostsMatch?.find(item => item.nmID === el.nmId)?.initialCosts), 0),
            salesPrice: content?.toClient?.reduce((acc, el) => acc + (el.inWayToClient * el.Price), 0) || 0,
            quantity: content?.toClient?.reduce((acc, el) => acc + (el.inWayToClient), 0) || 0,
        },
        {
            name: "Едет от клиента",
            initialPrice: content?.fromClient?.reduce((acc, el) => acc + (el.inWayToClient * stockAndCostsMatch?.find(item => item.nmID === el.nmId)?.initialCosts), 0),
            salesPrice: content?.fromClient?.reduce((acc, el) => acc + (el.inWayFromClient * el.Price), 0) || 0,
            quantity: content?.fromClient?.reduce((acc, el) => acc + (el.inWayFromClient), 0) || 0,
        },
        {
            name: "Не распределено",
            initialPrice: wbData?.stocks?.data?.reduce((acc, el) => acc + (el.quantity * stockAndCostsMatch?.find(item => item.nmID === el.nmId)?.initialCosts), 0),
            salesPrice: content?.notSorted?.sum,
            quantity: content?.notSorted?.amount,
        },
    ]

    const costsData = [
        {
            name: 'Реклама (ДРР (общий))',
            amount: content?.advertisment?.expensesCurrentPeriod || '0',
            percent: content?.advertisment?.expensesPercentageCurrentPeriod || '0',
            percentRate: content?.advertisment?.growthPercentageExpenses || '0',
            percentRate2: content?.advertisment?.growthPercentageExpensesPercentage || '0'
        },
        {
            name: 'Комиссия (от выручки)',
            amount: content?.commissionFromProfit?.commissionSum || '0',
            percent: content?.commissionFromProfit?.commissionPercent || '0',
            percentRate: content?.commissionFromProfit?.commissionSumGrowth || '0',
            percentRate2: content?.commissionFromProfit?.commissionPercentGrowth || '0'
        },
        {
            name: 'Логистика (от выручки)',
            amount: content?.logisticsFromProfit?.deliverySum || '0',
            percent: content?.logisticsFromProfit?.percent || '0',
            percentRate: content?.logisticsFromProfit?.deliveryGrowth || '0',
            percentRate2: content?.logisticsFromProfit?.percentGrowth || '0'
        },
    ]

    const vp = sales ? sales.reduce((obj, item) => {
        obj['amount'] = sales.reduce((acc, el) => acc + (el.finishedPrice - state?.initialCostsAndTax?.data?.find(item => item.nmID === el.nmId)?.initialCosts), 0) || 0
        obj['rate'] = content?.grossProfit?.percent || '0'
        return obj
    }, {}) : null

    const financeData = [
        {
            name: 'Выручка',
            amount: curOrders?.selectedPeriod?.buyoutsSumRub || '0',
            rate: curOrders?.periodComparison?.buyoutsSumRubDynamics || '0',
        },
        {
            name: 'Себестоимость продаж',
            amount: selfCost || '0',
            rate: 0,
        },
        {
            name: 'Маржинальная стоимость',
            amount: content?.marginCosts?.currentGrossMargin || '0',
            rate: content?.marginCosts?.marginGrowth?.toFixed(2) || '0',
        },
        {
            name: 'Валовая прибыль',
            amount: vp?.amount || '0',
            rate: content?.grossProfit?.percent,
        },
        {
            name: 'Налог',
            amount: tax ? curOrders?.selectedPeriod?.buyoutsSumRub / 100 * tax.value : '0',
            rate: content?.tax?.percent || '0',
        },
        {
            name: 'Чистая прибыль',
            amount: content?.netProfit?.sum ? content?.netProfit?.sum : tax ? curOrders?.selectedPeriod?.buyoutsSumRub - selfCost - curOrders?.selectedPeriod?.buyoutsSumRub / 100 * tax.value : '0' || '0',
            rate: content?.netProfit?.marginGrowth,
        },
        {
            name: 'Средняя прибыль',
            amount: content?.averageProfit?.averageReceiptLastDays || '0',
            rate: content?.averageProfit?.growthRate?.toFixed(2) || '0',
        },
    ]

    const salesSelfCost = sales && sales ? sales.reduce((acc, el) => acc + (state?.initialCostsAndTax?.data?.find(item => item.nmID === el.nmId)?.initialCosts || 0), 0) : 0

    const profitabilityData = [
        {
            name: 'Процент выкупа',
            value: curOrders?.selectedPeriod?.conversions?.buyoutsPercent || '0'
        },
        {
            name: 'ROI',
            value: ((curOrders?.selectedPeriod?.buyoutsSumRub - salesSelfCost) / salesSelfCost) * 100 || '0'
        },
        {
            name: 'Рентабельность ВП',
            value: 100 * vp?.amount / curOrders?.selectedPeriod?.buyoutsSumRub || '0'
        },
        {
            name: 'Рентабельность ОП',
            value: (curOrders?.selectedPeriod?.buyoutsSumRub - (curOrders?.selectedPeriod?.buyoutsSumRub / 100 * tax?.value) || 0) / sales?.reduce((acc, item) => acc + item.forPay, 0) * 100 || '0'
        },
    ]


    const [loading, setLoading] = useState(true)
    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 5000);
    }, [loading])


    const changePeriod = () => {
        setLoading(true)
        if (user && days && activeBrand) {
            ServiceFunctions.getFilteredCollection(user.id, days, activeBrand).then(data => setWbData(filterArrays(data, days)))
        }
    }

    const uniquSalesDate = [...new Set(sales.map(i => formatDate(new Date(i.date))))]
    const uniquOrdersDate = [...new Set(orders.map(i => formatDate(new Date(i.date))))]
    const labels = [...new Set(uniquOrdersDate.concat(uniquSalesDate))]

    useEffect(() => {
        changePeriod()
    }, [days, activeBrand])

    const [byMoney, setByMoney] = useState(true)
    const [byAmount, setByAmount] = useState(true)

    const orderValuesRub = orders && orders.length ? orders?.map(i => ({ price: i.finishedPrice, date: new Date(i.date).toLocaleDateString() })) : []
    const salesValuesRub = sales && sales.length ? sales?.map(i => ({ price: i.finishedPrice, date: new Date(i.date).toLocaleDateString() })) : []

    const summedOrderRub = orderValuesRub.reduce((acc, curr) => {
        if (acc[curr.date]) {
            acc[curr.date] += curr.price;
        } else {
            acc[curr.date] = curr.price;
        }
        return acc;
    }, {});

    const summedSalesRub = salesValuesRub.reduce((acc, curr) => {
        if (acc[curr.date]) {
            acc[curr.date] += curr.price;
        } else {
            acc[curr.date] = curr.price;
        }
        return acc;
    }, {});

    const summedOrderArray = Object.keys(summedOrderRub).map(date => (summedOrderRub[date].toFixed(2))).slice(0, days);
    const summedSalesArray = Object.keys(summedSalesRub).map(date => (summedSalesRub[date].toFixed(2))).slice(0, days);


    const ordersByDate = orderValuesRub.reduce((acc, item) => {
        const { date } = item;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const salesByDate = salesValuesRub.reduce((acc, item) => {
        const { date } = item;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const totalOrByDate = Object.entries(ordersByDate).map(([date, count]) => count).slice(0, days);
    const totalsalesByDate = Object.entries(salesByDate).map(([date, count]) => count).slice(0, days);

    const [orderOn, setOrderOn] = useState(true)
    const [orderLineOn, setOrderLineOn] = useState(true)
    const [salesOn, setSalesOn] = useState(true)
    const [salesLineOn, setSalesLineOn] = useState(true)


    const data = {
        labels: labels?.map(item => item.split(' ')) || [],
        datasets: [
            orderLineOn ? {
                label: 'Заказы',
                borderRadius: 8,
                type: 'line',
                backgroundColor: 'rgba(255, 219, 126, 1)',
                borderWidth: 2,
                pointRadius: 5,
                pointBorderColor: 'rgba(230, 230, 230, 0.8)',
                borderColor: 'rgba(255, 219, 126, 1)',
                hoverBackgroundColor: 'rgba(240, 173, 0, 7)',
                yAxisID: 'A',
                data: summedOrderArray || [],
            } : {
                label: 'Заказы',
                borderRadius: 8,
                type: 'line',
                backgroundColor: 'rgba(255, 219, 126, 1)',
                borderWidth: 2,
                pointRadius: 5,
                pointBorderColor: 'rgba(230, 230, 230, 0.8)',
                borderColor: 'rgba(255, 219, 126, 1)',
                hoverBackgroundColor: 'rgba(240, 173, 0, 7)',
                yAxisID: 'A',
                data: []
            },
            salesLineOn ? {
                label: 'Продажи',
                borderRadius: 8,
                type: 'line',
                backgroundColor: 'rgba(154, 129, 255, 1)',
                borderWidth: 2,
                pointRadius: 5,
                pointBorderColor: 'rgba(230, 230, 230, 0.8)',
                borderColor: 'rgba(154, 129, 255, 1)',
                hoverBackgroundColor: 'rgba(83, 41, 255, 0.7)',
                yAxisID: 'A',
                data: summedSalesArray || [],
            } : {
                label: 'Продажи',
                borderRadius: 8,
                type: 'line',
                backgroundColor: 'rgba(154, 129, 255, 1)',
                borderWidth: 2,
                pointRadius: 5,
                pointBorderColor: 'rgba(230, 230, 230, 0.8)',
                borderColor: 'rgba(154, 129, 255, 1)',
                hoverBackgroundColor: 'rgba(83, 41, 255, 0.7)',
                yAxisID: 'A',
                data: []
            },
            orderOn ? {
                label: 'Заказы',
                borderRadius: 8,
                type: 'bar',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, "rgba(240, 173, 0, 1)");
                    gradient.addColorStop(0.5, "rgba(240, 173, 0, 0.9)");
                    gradient.addColorStop(1, "rgba(240, 173, 0, 0.5)");
                    return gradient;
                },
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(240, 173, 0, 7)',
                yAxisID: 'B',
                data: totalOrByDate || [],
            } : {
                label: 'Заказы',
                borderRadius: 8,
                type: 'bar',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, "rgba(240, 173, 0, 1)");
                    gradient.addColorStop(0.5, "rgba(240, 173, 0, 0.9)");
                    gradient.addColorStop(1, "rgba(240, 173, 0, 0.5)");
                    return gradient;
                },
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(240, 173, 0, 7)',
                yAxisID: 'B',
                data: []
            },
            salesOn ? {
                label: 'Продажи',
                borderRadius: 8,
                type: 'bar',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
                    gradient.addColorStop(0, "rgba(83, 41, 255, 1)");
                    gradient.addColorStop(0.5, "rgba(83, 41, 255, 0.9)");
                    gradient.addColorStop(1, "rgba(83, 41, 255, 0.5)");
                    return gradient;
                },
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(83, 41, 255, 0.7)',
                yAxisID: 'B',
                data: totalsalesByDate || [],
            } : {
                label: 'Продажи',
                borderRadius: 8,
                type: 'bar',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
                    gradient.addColorStop(0, "rgba(83, 41, 255, 1)");
                    gradient.addColorStop(0.5, "rgba(83, 41, 255, 0.9)");
                    gradient.addColorStop(1, "rgba(83, 41, 255, 0.5)");
                    return gradient;
                },
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(83, 41, 255, 0.7)',
                yAxisID: 'B',
                data: []
            },
        ],
    };

    console.log(wbData);

    const sortedValuesArray = data?.datasets?.map(arr => arr?.data).flat(1)?.sort((a, b) => b - a)
    const maxValue = sortedValuesArray && sortedValuesArray.length ? sortedValuesArray[0] : 0

    const maxAmount = sortedValuesArray && sortedValuesArray.length ? sortedValuesArray.filter(item => typeof item === 'number')[0] : 50

    return (
        user && <div className='dashboard-page'>
            <SideNav />
            <div className="dashboard-content pb-3">
                <TopNav title={'Сводка продаж'} />

                {
                    wbData?.initialCostsAndTax === null || wbData?.initialCostsAndTax?.data?.length === 0 || wbData === null ?
                        <SelfCostWarning />
                        : null
                }
                {
                    wbData === null ?
                        <DataCollectionNotification />
                        :
                        null
                }
                <DashboardFilter
                    brandNames={brandNames}
                    defaultValue={days}
                    setDays={setDays}
                    changeBrand={setActiveBrand}
                />
                {
                    <div>
                        <div className="container dash-container p-3 pt-0 d-flex gap-3">
                            <MediumPlate name={'Заказы'}
                                value={curOrders?.selectedPeriod?.ordersSumRub}
                                quantity={curOrders?.selectedPeriod?.ordersCount}
                                percent={curOrders?.periodComparison?.avgPriceRubDynamics}
                                percent2={curOrders?.periodComparison?.avgOrdersCountPerDayDynamics}
                                text={curOrders?.selectedPeriod?.avgPriceRub * curOrders?.selectedPeriod?.avgOrdersCountPerDay}
                                text2={curOrders?.selectedPeriod?.avgOrdersCountPerDay}
                            />
                            <MediumPlate
                                name={'Продажи'}
                                value={curOrders?.selectedPeriod?.buyoutsSumRub}
                                quantity={curOrders?.selectedPeriod?.buyoutsCount}
                                percent={curOrders?.periodComparison?.buyoutsSumRubDynamics}
                                percent2={curOrders?.periodComparison?.buyoutsCountDynamics}
                                text={curOrders?.selectedPeriod?.buyoutsSumRub / days}
                                text2={curOrders?.selectedPeriod?.buyoutsCount / days}
                            />
                            <MediumPlate
                                name={'Возвраты'}
                                value={curOrders?.selectedPeriod?.cancelSumRub}
                                quantity={curOrders?.selectedPeriod?.cancelCount}
                                percent={curOrders?.periodComparison?.cancelSumRubDynamics}
                                percent2={curOrders?.periodComparison?.cancelCountDynamics}
                            // text={content?.returned?.currentReturnsCount }
                            // text2={content?.returned?.currentReturnsCount }
                            />
                            <div className="col d-flex flex-column" style={{ gap: '2vh' }}>
                                <div className='' style={{ height: '11vh' }}>
                                    <SmallPlate
                                        name={'Процент выкупа'}
                                        value={curOrders?.selectedPeriod?.conversions?.buyoutsPercent}
                                        type={'percent'}
                                        percent={curOrders?.periodComparison?.conversions?.buyoutsPercent || '0'}
                                    />
                                </div>
                                <div className='' style={{ height: '11vh' }}>
                                    <SmallPlate
                                        name={'Средний чек'}
                                        value={curOrders?.selectedPeriod?.avgPriceRub}
                                        type={'price'}
                                        percent={curOrders?.periodComparison?.avgPriceRubDynamics}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="container dash-container p-3 pt-0 pb-3 d-flex gap-3">
                            <div className="col chart-wrapper">
                                <BigChart name={'Заказы и продажи'} data={data}
                                    orderOn={orderOn}
                                    salesOn={salesOn}
                                    setOrderOn={setOrderOn}
                                    setSalesOn={setSalesOn}
                                    setOrderLineOn={setOrderLineOn}
                                    setSalesLineOn={setSalesLineOn}
                                    orderLineOn={orderLineOn}
                                    salesLineOn={salesLineOn}
                                    setByMoney={setByMoney}
                                    byAmount={byAmount}
                                    byMoney={byMoney}
                                    loading={loading}
                                    days={days}
                                    wbData={wbData}

                                    maxValue={maxValue}
                                    maxAmount={maxAmount}
                                />
                            </div>
                        </div>


                        <div className="container dash-container p-4 pt-0 pb-3 d-flex gap-3">
                            <div className="col" style={{ height: '14vh' }}>
                                <SmallPlate minHeight={'12vh'} smallText={true}
                                    name={'Себестоимость проданных товаров'}
                                    nochart={true}
                                    type={'price'}
                                    quantity={curOrders?.selectedPeriod?.buyoutsCount}
                                    value={selfCost}
                                />
                            </div>
                            <div className="col" style={{ height: '14vh' }}>
                                <SmallPlate minHeight={'12vh'}
                                    smallText={true}
                                    name={'Возвраты'}
                                    value={curOrders?.selectedPeriod?.cancelSumRub}
                                    quantity={curOrders?.selectedPeriod?.cancelCount}
                                    type={'price'}
                                />
                            </div>
                            <div className="col" style={{ height: '14vh' }}>
                                <SmallPlate minHeight={'12vh'} smallText={true} name={'Штрафы WB'} value={content?.penalty} type={'price'} nochart={true} />
                            </div>
                            <div className="col" style={{ height: '14vh' }}>
                                <SmallPlate minHeight={'12vh'} smallText={true} name={'Доплаты WB'} value={content?.additionalPayment} type={'price'} nochart={true} />
                            </div>
                        </div>
                        <div className="container dash-container p-4 pt-0 d-flex gap-3">
                            <div className="col" style={{ height: '14vh' }}>
                                <SmallPlate minHeight={'12vh'} smallText={true} name={'Комиссия WB'} value={content?.wbComission?.currentPeriodCommission * -1 || '0'} type={'price'}
                                    percent={content?.wbComission?.growthPercentage * -1}
                                />
                            </div>
                            <div className="col" style={{ height: '14vh' }}>
                                <SmallPlate minHeight={'12vh'} smallText={true} name={'Расходы на логистику'} value={content?.logistics?.totalDeliveryCostCurrentPeriod || '0'} type={'price'}
                                    percent={content?.logistics?.percentageGrowth}
                                />
                            </div>
                            <div className="col" style={{ height: '14vh' }}>
                                <SmallPlate minHeight={'12vh'} smallText={true} name={'Маржинальная прибыль'}
                                    value={(curOrders?.selectedPeriod?.buyoutsSumRub) - selfCost}
                                    percent={content?.marginRevenue?.profitGrowth}
                                    type={'price'}
                                />
                            </div>
                            <div className="col" style={{ height: '14vh' }}>
                                <SmallPlate minHeight={'12vh'} smallText={true} name={'Упущенные продажи'}
                                    type={'price'}
                                    value={curOrders?.selectedPeriod?.cancelSumRub}
                                    quantity={curOrders?.selectedPeriod?.cancelCount}
                                />
                            </div>
                        </div>

                        <div className="container dash-container p-4 pt-0 pb-3 mb-2 d-flex gap-3" style={{ width: '100%' }}>
                            <div className="wrapper">
                                <FinanceTable title={'Финансы'} data={financeData} wbData={wbData} />
                                <StorageTable
                                    wbData={wbData}
                                    title={'Склад'}
                                    data={storeData}
                                    titles={['Где товар', "Капитализация", "", "Остатки"]}
                                    subtitles={['', 'Себестоимость', 'Розница', '']}
                                />
                            </div>
                            <div className="wrapper">
                                <FinanceTable title={'Прибыльность'} data={profitabilityData} sign={' %'} wbData={wbData} />
                                <ChartTable title={'Расходы'} data={costsData} wbData={wbData} />
                            </div>
                        </div>
                        <div className="container dash-container p-4 pt-0 pb-3 d-flex gap-3" style={{ width: '100%' }}>
                            <WidePlate
                                title={'ABC-анализ'}
                                titles={['Группа А', "Группа В", "Группа С"]}
                                data={wbData && wbData.sales ? abcAnalysis(wbData.sales.data) : []}
                            />
                        </div>
                    </div>
                }

            </div>
        </div>
    )
}

export default DashboardPage