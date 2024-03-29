import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Layout/Header'
import PageTitle from '../Layout/PageTitle'
import Footer from '../Layout/Footer'
import background from './../../images/background/orderBackground.jpg';
import demo from './../../images/gallery/simp.jpg';

export default function Order() {
    const [activeItem, setActiveItem] = useState('Pending');
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const accessToken = localStorage.getItem('accessToken');

    const handleItemClick = (itemName) => {
        setActiveItem(itemName);
    };

    const isActive = (itemName) => {
        return activeItem === itemName ? 'active-item' : '';
    };

    useEffect(() => {

        const fetchOrders = async () => {
            setLoading(true);
            const statusQueryParam = activeItem.replace(' ', '');
            const accessToken = localStorage.getItem('accessToken');
            const url = `https://www.kidpro-production.somee.com/api/v1/orders?status=${statusQueryParam}`;

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setOrders(data); // Assuming the API returns an array of orders
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [activeItem]);

    const ViewOrderDetail = (orderId) => {
        if (orderId) {
            navigate(`/order-detail/${orderId}`);
        } else {
            console.error('Order ID is undefined');
        }
    };

    const OrderItems = () => {
        if (loading) {
            return (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (orders.length === 0) {
            return (
                <div className='order-item'>
                    <p className="text-center">You do not have this type of order.</p>
                </div>
            );
        }

        return orders.map((order, index) => (
            <div key={index} onClick={() => ViewOrderDetail(order.orderId)} className='order-item'>
                <div className="header d-flex justify-content-between">
                    <div className="d-flex justify-content-start">
                        <i style={{ color: '#FF8A00' }} className="fa-solid fa-user"></i>
                        <p style={{ marginLeft: '10px' }}>Order code: </p>
                        <p style={{ marginLeft: '10px' }}>{order.orderCode}</p>
                    </div>
                    <span>{order.orderStatus}</span>
                </div>
                <div className="content d-flex">
                    <img className='img-responsive' src={demo} alt="" />
                    <p>{order.courseName}</p>
                    <p>Quantity: {order.quantity}</p>
                    <p style={{ color: '#FF8A00' }}>{order.totalPrice} đ</p>
                </div>
            </div>
        ));
    };

    return (
        <div>
            <Header />
            <PageTitle motherMenu="Order" activeMenu="Order" />
            <div style={{
                backgroundImage: `url(${background})`, minHeight: '800px', backgroundPosition: 'center center', // Center the background image
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat'
            }}>
                <div className="container">
                    <div className="order-menu row">
                        {['Pending', 'Success', 'Request refund', 'Refunded'].map((item, index) => (
                            <div key={index} className={`order-menu-item col-lg-2 col-md-2 col-sm-2 ${isActive(item)}`} onClick={() => handleItemClick(item)}>
                                <p className='text-center'>{item}</p>
                                <hr />
                            </div>
                        ))}
                        <div className='order-menu-sub col-lg-4 d-md-none d-lg-block d-sm-none d-md-block'>
                            <p></p>
                        </div>
                    </div>
                    <div className="order-content">
                        <OrderItems />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

