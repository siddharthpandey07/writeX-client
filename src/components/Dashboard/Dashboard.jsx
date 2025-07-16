"use client"

import { useState } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from "antd"
import {
  HomeOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons"
import { useAuth } from "../../contexts/AuthContext"
import Posts from "./Posts"
import Notes from "./Notes"
import Profile from "./Profile"
import Users from "./Users"

const { Header, Sider, Content } = Layout
const { Text } = Typography

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: "/dashboard",
      icon: <HomeOutlined />,
      label: "Posts",
    },
    {
      key: "/dashboard/notes",
      icon: <FileTextOutlined />,
      label: "My Notes",
    },
    {
      key: "/dashboard/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "/dashboard/users",
      icon: <TeamOutlined />,
      label: "Users",
    },
  ]

  const userMenuItems = [
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} className="bg-white shadow-lg" width={250}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar size={collapsed ? 32 : 40} src={user?.avatar} icon={<UserOutlined />} className="bg-blue-500" />
            {!collapsed && (
              <div>
                <Text strong className="block text-gray-800">
                  {user?.username}
                </Text>
                <Text type="secondary" className="text-xs">
                  {user?.email}
                </Text>
              </div>
            )}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0"
        />
      </Sider>

      <Layout>
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
              <Avatar size={32} src={user?.avatar} icon={<UserOutlined />} className="bg-blue-500" />
              <Text strong>{user?.username}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content className="p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<Posts />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default Dashboard
