"use client"

import { useState, useEffect } from "react"
import { Card, Button, Input, Avatar, Typography, Space, message, Modal, Dropdown } from "antd"
import {
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
} from "@ant-design/icons"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"
import CreatePostModal from "./CreatePostModal"
import moment from "moment"

const { TextArea } = Input
const { Text, Paragraph } = Typography

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const Posts = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [commentInputs, setCommentInputs] = useState({})
  const { user } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/posts`)
      setPosts(response.data)
    } catch (error) {
      message.error("Failed to fetch posts")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (content) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/posts`, { content })
      setPosts([response.data, ...posts])
      message.success("Post created successfully!")
    } catch (error) {
      message.error("Failed to create post")
    }
  }

  const handleEditPost = async (postId, content) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/posts/${postId}`, { content })
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)))
      message.success("Post updated successfully!")
    } catch (error) {
      message.error("Failed to update post")
    }
  }

  const handleDeletePost = async (postId) => {
    Modal.confirm({
      title: "Delete Post",
      content: "Are you sure you want to delete this post?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/posts/${postId}`)
          setPosts(posts.filter((post) => post._id !== postId))
          message.success("Post deleted successfully!")
        } catch (error) {
          message.error("Failed to delete post")
        }
      },
    })
  }

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/posts/${postId}/like`)
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)))
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to like post")
    }
  }

  const handleComment = async (postId) => {
    const content = commentInputs[postId]
    if (!content?.trim()) return

    try {
      const response = await axios.post(`${API_BASE_URL}/api/posts/${postId}/comment`, { content })
      setPosts(posts.map((post) => (post._id === postId ? response.data : post)))
      setCommentInputs({ ...commentInputs, [postId]: "" })
      message.success("Comment added!")
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to add comment")
    }
  }

  const isLiked = (post) => {
    return post.likes.some((like) => like.user === user._id)
  }

  const canInteract = (post) => {
    return true;
  }

  const getPostActions = (post) => {
    if (post.author._id !== user._id) return []

    return [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit",
        onClick: () => setEditingPost(post),
      },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete",
        danger: true,
        onClick: () => handleDeletePost(post._id),
      },
    ]
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)} size="large">
          Create Post
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id} className="shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar src={post.author.avatar} icon={<UserOutlined />} size={40} />
                <div>
                  <Text strong>{post.author.username}</Text>
                  <div>
                    <Text type="secondary" className="text-sm">
                      {moment(post.createdAt).fromNow()}
                    </Text>
                  </div>
                </div>
              </div>

              {post.author._id === user._id && (
                <Dropdown menu={{ items: getPostActions(post) }} trigger={["click"]}>
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              )}
            </div>

            <Paragraph className="mb-4 text-gray-800">{post.content}</Paragraph>

            <div className="flex items-center justify-between border-t pt-3">
              <Space>
                <Button
                  type="text"
                  icon={isLiked(post) ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                  onClick={() => handleLike(post._id)}
                  disabled={!canInteract(post)}
                >
                  {post.likes.length}
                </Button>
                <Button type="text" icon={<CommentOutlined />} disabled={!canInteract(post)}>
                  {post.comments.length}
                </Button>
              </Space>
            </div>

            {post.comments.length > 0 && (
              <div className="mt-4 space-y-3">
                {post.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3 items-start">
                    <Avatar src={comment.user.avatar} icon={<UserOutlined />} size={24} />
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
                        <div>
                          <Text strong className="text-sm">
                            {comment.user.username}
                          </Text>
                          <div className="text-sm text-gray-800">{comment.content}</div>
                        </div>
                        {comment.user._id === user._id && (
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            danger
                            size="small"
                            onClick={async () => {
                              try {
                                await axios.delete(`${API_BASE_URL}/api/posts/${post._id}/comments/${comment._id}`);
                                setPosts(posts.map((p) =>
                                  p._id === post._id
                                    ? { ...p, comments: p.comments.filter((c) => c._id !== comment._id) }
                                    : p
                                ));
                                message.success("Comment deleted");
                              } catch (error) {
                                message.error(error.response?.data?.message || "Failed to delete comment");
                              }
                            }}
                          />
                        )}
                      </div>
                      <Text type="secondary" className="text-xs ml-3">
                        {moment(comment.createdAt).fromNow()}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {canInteract(post) && (
              <div className="mt-4 flex space-x-2">
                <Avatar src={user.avatar} icon={<UserOutlined />} size={32} />
                <div className="flex-1 flex space-x-2">
                  <Input
                    placeholder="Write a comment..."
                    value={commentInputs[post._id] || ""}
                    onChange={(e) =>
                      setCommentInputs({
                        ...commentInputs,
                        [post._id]: e.target.value,
                      })
                    }
                    onPressEnter={() => handleComment(post._id)}
                  />
                  <Button
                    type="primary"
                    onClick={() => handleComment(post._id)}
                    disabled={!commentInputs[post._id]?.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <CreatePostModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreatePost}
        editingPost={editingPost}
        onEdit={handleEditPost}
        onEditComplete={() => setEditingPost(null)}
      />
    </div>
  )
}

export default Posts
