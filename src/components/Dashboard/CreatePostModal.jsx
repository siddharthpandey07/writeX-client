"use client"

import { useState, useEffect } from "react"
import { Modal, Input, Button } from "antd"

const { TextArea } = Input

const CreatePostModal = ({ visible, onCancel, onSubmit, editingPost, onEdit, onEditComplete }) => {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingPost) {
      setContent(editingPost.content)
    } else {
      setContent("")
    }
  }, [editingPost])

  const handleSubmit = async () => {
    if (!content.trim()) return

    setLoading(true)
    try {
      if (editingPost) {
        await onEdit(editingPost._id, content)
        onEditComplete()
      } else {
        await onSubmit(content)
      }
      setContent("")
      onCancel()
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setContent("")
    onCancel()
    if (editingPost) {
      onEditComplete()
    }
  }

  return (
    <Modal
      title={editingPost ? "Edit Post" : "Create New Post"}
      open={visible || !!editingPost}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit} disabled={!content.trim()}>
          {editingPost ? "Update" : "Post"}
        </Button>,
      ]}
    >
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={4}
        maxLength={1000}
        showCount
      />
    </Modal>
  )
}

export default CreatePostModal
