"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Form, Input, Button, Card, Typography, message, Space } from "antd"
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons"
import { useAuth } from "../../contexts/AuthContext"

const { Title, Text } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const onFinish = async (values) => {
    setLoading(true)
    const result = await login(values.email, values.password)

    if (result.success) {
      message.success("Login successful!")
    } else {
      message.error(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Title level={2} className="text-gray-800 mb-2">
            Welcome Back
          </Title>
          <Text type="secondary">Sign in to your account to continue</Text>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<LoginOutlined />} className="w-full">
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Space>
            <Text type="secondary">Don't have an account?</Text>
            <Link to="/register" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default Login
