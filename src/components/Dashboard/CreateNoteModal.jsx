"use client"

import { useState, useEffect } from "react"
import { Modal, Input, Button, Tag, Space } from "antd"
import { PlusOutlined } from "@ant-design/icons"

const { TextArea } = Input

const CreateNoteModal = ({ visible, onCancel, onSubmit, editingNote, onEdit, onEditComplete }) => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState([])
  const [inputTag, setInputTag] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title)
      setContent(editingNote.content)
      setTags(editingNote.tags || [])
    } else {
      setTitle("")
      setContent("")
      setTags([])
    }
  }, [editingNote])

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    try {
      const noteData = { title, content, tags }

      if (editingNote) {
        await onEdit(editingNote._id, noteData)
        onEditComplete()
      } else {
        await onSubmit(noteData)
      }

      resetForm()
      onCancel()
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    resetForm()
    onCancel()
    if (editingNote) {
      onEditComplete()
    }
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setTags([])
    setInputTag("")
  }

  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag])
      setInputTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <Modal
      title={editingNote ? "Edit Note" : "Create New Note"}
      open={visible || !!editingNote}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim()}
        >
          {editingNote ? "Update" : "Create"}
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            maxLength={200}
            showCount
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note content..."
            rows={8}
            maxLength={5000}
            showCount
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="mb-2">
            <Space wrap>
              {tags.map((tag) => (
                <Tag key={tag} closable onClose={() => handleRemoveTag(tag)} color="blue">
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
          <div className="flex space-x-2">
            <Input
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              placeholder="Add a tag..."
              onPressEnter={handleAddTag}
              maxLength={50}
            />
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddTag}
              disabled={!inputTag || tags.includes(inputTag)}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CreateNoteModal
