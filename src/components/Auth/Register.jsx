"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Form, Input, Button, Card, Typography, message, Space } from "antd"
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from "@ant-design/icons"
import { useAuth } from "../../contexts/AuthContext"

const { Title, Text } = Typography

const Register = () => {
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const onFinish = async (values) => {
    setLoading(true)
    const result = await register(values.username, values.email, values.password)

    if (result.success) {
      message.success("Registration successful!")
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
            Create Account
          </Title>
          <Text type="secondary">Join our community today</Text>
        </div>

        <Form name="register" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Please input your username!" },
              { min: 3, message: "Username must be at least 3 characters!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Choose a username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Create a password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("Passwords do not match!"))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<UserAddOutlined />} className="w-full">
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Space>
            <Text type="secondary">Already have an account?</Text>
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default Register
