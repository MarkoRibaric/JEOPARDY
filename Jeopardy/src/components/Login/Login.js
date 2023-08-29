import React from 'react'
import './login.css';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { Toast } from 'react-bootstrap';

export default function Login(props) {
    const navigate = useNavigate();
    const onFinish = values => {
        const { username, password } = values;
        fetch('http://localhost:5000/validatePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.validation) {
                    const userId = data.userId;
                    const token = data.token;
                    props.handleGoToIndexPage(username, userId, token);
                    navigate('/gameboard');
                } else {
                    alert('Your password is incorrect');
                }
            })
            .catch(error => {
                console.error('Error calling validatePassword API:', error);
            });
    }

    const onFinish2 = values => {
        const { username, password } = values;
        fetch('http://localhost:5000/registerUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                } else {
                    
                    alert('Registration failed');
                }
            })
            .catch(error => {
                console.error('Error calling registerUser API:', error);
            });
    };
    return (
        <div className="app-background align-items-center d-flex h-100 justify-content-center w-100">
            <div className="app-background-login align-items-center bg-light border d-flex gap-5 p-5 rounded">
            <div>
                <Form
                    name="normal_login"
                    className="normal-login d-flex flex-column align-items-center"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item>
                        <div className='fw-bold'>
                        LOGIN
                        </div>
                    
                    </Form.Item>
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Username!',
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Password!',
                            },
                        ]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </div>



            <div>
                <Form
                    name="register_login"
                    className="register-login d-flex flex-column align-items-center"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish2}
                >
                <Form.Item>
                        <div className='fw-bold'>
                        REGISTRATION
                        </div>
                    
                    </Form.Item>
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your desired Username!',
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Password!',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="Password"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password2"
                        dependencies={['password']}
                        rules={[
                            {
                                required: true,
                                message: 'Please repeat your Password!',
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="Repeat Password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="login-form-button">
                            Sign up
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
        </div>
    )
}