"use client"

import { useState, useEffect } from "react"
import { Card, Avatar, Typography, Button, Input, message, Space, Statistic, Divider } from "antd"
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState("")
  const [loading, setLoading] = useState(false)
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
  })
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (user) {
      setBio(user.bio || "")
      setAvatar(user.avatar || "")
      fetchUserStats()
    }
  }, [user])

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE_URL = import.meta.env.VITE_API_URL || "";
        const res = await axios.get(`${API_BASE_URL}/api/users/me/follow`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowers(res.data.followers);
        setFollowing(res.data.following);
      } catch (err) {
      }
    };
    fetchFollowData();
  }, []);

  const fetchUserStats = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "";
      const response = await axios.get(`${API_BASE_URL}/api/users/${user._id}`)
      const { user: userData, posts } = response.data
      setUserStats({
        postsCount: posts.length,
        followersCount: userData.followers.length,
        followingCount: userData.following.length,
      })
    } catch (error) {
      console.error("Failed to fetch user stats:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "";
      const response = await axios.put(`${API_BASE_URL}/api/users/profile`, { bio, avatar })
      updateUser(response.data)
      setEditing(false)
      message.success("Profile updated successfully!")
    } catch (error) {
      message.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setBio(user.bio || "")
    setAvatar(user.avatar || "")
    setEditing(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-sm">
        <div className="text-center mb-6">
          <Avatar size={120} src={avatar || user?.avatar} icon={<UserOutlined />} className="bg-blue-500 mb-4" />

          <Title level={2} className="mb-2">
            {user?.username}
          </Title>

          <Text type="secondary" className="text-lg">
            {user?.email}
          </Text>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Statistic title="Posts" value={userStats.postsCount} valueStyle={{ color: "#1890ff" }} />
          </div>
          <div className="text-center">
            <Statistic title="Followers" value={userStats.followersCount} valueStyle={{ color: "#52c41a" }} />
          </div>
          <div className="text-center">
            <Statistic title="Following" value={userStats.followingCount} valueStyle={{ color: "#722ed1" }} />
          </div>
        </div>

        <Divider />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Title level={4} className="mb-0">
              Bio
            </Title>
            {!editing && (
              <Button type="text" icon={<EditOutlined />} onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Avatar URL</label>
                <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="Enter avatar URL..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <TextArea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </div>

              <Space>
                <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
                  Save
                </Button>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Cancel
                </Button>
              </Space>
            </div>
          ) : (
            <Paragraph className="text-gray-600">{bio || "No bio available. Click edit to add one!"}</Paragraph>
          )}
        </div>

        <div className="flex gap-8 mt-4">
          <div>
            <h3 className="font-bold">Followers</h3>
            <ul>
              {followers.map((user) => (
                <li key={user._id} className="flex items-center gap-2 mt-2">
                  <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                  <span>{user.username}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Following</h3>
            <ul>
              {following.map((user) => (
                <li key={user._id} className="flex items-center gap-2 mt-2">
                  <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                  <span>{user.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">
          Member since {new Date(user?.createdAt).toLocaleDateString()}
        </div>
      </Card>
    </div>
  )
}

export default Profile
