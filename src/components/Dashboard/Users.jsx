"use client"

import { useState, useEffect } from "react"
import { Card, Avatar, Typography, Button, Input, message, Empty } from "antd"
import { UserOutlined, UserAddOutlined, UserDeleteOutlined, SearchOutlined } from "@ant-design/icons"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"

const { Title, Text } = Typography
const { Search } = Input

const Users = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [followingUsers, setFollowingUsers] = useState(new Set())
  const { user, updateUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm])

  useEffect(() => {
    if (user?.following) {
      setFollowingUsers(new Set(user.following))
    }
  }, [user])

  const API_BASE_URL = import.meta.env.VITE_API_URL || "";

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`)
      setUsers(response.data)
    } catch (error) {
      message.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (u) =>
          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.bio && u.bio.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredUsers(filtered)
    }
  }

  const handleFollow = async (userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/${userId}/follow`)
      const isNowFollowing = response.data.isFollowing

      if (isNowFollowing) {
        setFollowingUsers(new Set([...followingUsers, userId]))
      } else {
        const newFollowing = new Set(followingUsers)
        newFollowing.delete(userId)
        setFollowingUsers(newFollowing)
      }

      const updatedUser = {
        ...user,
        following: isNowFollowing
          ? [...(user.following || []), userId]
          : (user.following || []).filter((_id) => _id !== userId),
      }
      updateUser(updatedUser)

      message.success(response.data.message)
    } catch (error) {
      message.error("Failed to follow/unfollow user")
    }
  }

  const isFollowing = (userId) => {
    return followingUsers.has(userId)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="mb-0">
          Discover Users
        </Title>
      </div>

      <div className="mb-6">
        <Search
          placeholder="Search users by username, email, or bio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
          size="large"
        />
      </div>

      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u) => (
            <UserCard key={u._id} user={u} isFollowing={isFollowing(u._id)} onFollow={handleFollow} />
          ))}
        </div>
      ) : (
        <Empty description="No users found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  )
}

const UserCard = ({ user, isFollowing, onFollow }) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <div className="text-center mb-4">
        <Avatar size={64} src={user.avatar} icon={<UserOutlined />} className="bg-blue-500 mb-3" />
        <Title level={5} className="mb-1">
          {user.username}
        </Title>
        <Text type="secondary" className="text-sm">
          {user.email}
        </Text>
      </div>

      {user.bio && (
        <div className="mb-4">
          <Text className="text-sm text-gray-600 line-clamp-2">{user.bio}</Text>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
        <span>{user.followers?.length || 0} followers</span>
        <span>{user.following?.length || 0} following</span>
      </div>

      <Button
        type={isFollowing ? "default" : "primary"}
        icon={isFollowing ? <UserDeleteOutlined /> : <UserAddOutlined />}
        onClick={() => onFollow(user._id)}
        className="w-full"
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </Card>
  )
}

export default Users
