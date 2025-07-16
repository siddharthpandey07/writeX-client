"use client"

import { useState, useEffect } from "react"
import { Card, Button, Input, Typography, message, Modal, Tag, Empty } from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PushpinOutlined,
  PushpinFilled,
  SearchOutlined,
} from "@ant-design/icons"
import axios from "axios"
import CreateNoteModal from "./CreateNoteModal"
import moment from "moment"

const { Search } = Input
const { Text, Title } = Typography

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    filterNotes()
  }, [notes, searchTerm])

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notes`)
      setNotes(response.data)
    } catch (error) {
      message.error("Failed to fetch notes")
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    if (!searchTerm) {
      setFilteredNotes(notes)
    } else {
      const filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredNotes(filtered)
    }
  }

  const handleCreateNote = async (noteData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/notes`, noteData)
      setNotes([response.data, ...notes])
      message.success("Note created successfully!")
    } catch (error) {
      message.error("Failed to create note")
    }
  }

  const handleEditNote = async (noteId, noteData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/notes/${noteId}`, noteData)
      setNotes(notes.map((note) => (note._id === noteId ? response.data : note)))
      message.success("Note updated successfully!")
    } catch (error) {
      message.error("Failed to update note")
    }
  }

  const handleDeleteNote = async (noteId) => {
    Modal.confirm({
      title: "Delete Note",
      content: "Are you sure you want to delete this note?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/notes/${noteId}`)
          setNotes(notes.filter((note) => note._id !== noteId))
          message.success("Note deleted successfully!")
        } catch (error) {
          message.error("Failed to delete note")
        }
      },
    })
  }

  const handlePinNote = async (noteId, isPinned) => {
    try {
      const note = notes.find((n) => n._id === noteId)
      const response = await axios.put(`${API_BASE_URL}/api/notes/${noteId}`, {
        ...note,
        isPinned: !isPinned,
      })
      setNotes(notes.map((note) => (note._id === noteId ? response.data : note)))
      message.success(`Note ${!isPinned ? "pinned" : "unpinned"} successfully!`)
    } catch (error) {
      message.error("Failed to update note")
    }
  }

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned)
  const regularNotes = filteredNotes.filter((note) => !note.isPinned)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="mb-0">
          My Notes
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)} size="large">
          Create Note
        </Button>
      </div>

      <div className="mb-4">
        <Search
          placeholder="Search notes by title, content, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
          size="large"
        />
      </div>

      {pinnedNotes.length > 0 && (
        <div className="mb-6">
          <Title level={4} className="text-gray-600 mb-3">
            <PushpinFilled className="mr-2" />
            Pinned Notes
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={setEditingNote}
                onDelete={handleDeleteNote}
                onPin={handlePinNote}
              />
            ))}
          </div>
        </div>
      )}

      {regularNotes.length > 0 ? (
        <div>
          <Title level={4} className="text-gray-600 mb-3">
            All Notes
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={setEditingNote}
                onDelete={handleDeleteNote}
                onPin={handlePinNote}
              />
            ))}
          </div>
        </div>
      ) : (
        !pinnedNotes.length && <Empty description="No notes found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      <CreateNoteModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateNote}
        editingNote={editingNote}
        onEdit={handleEditNote}
        onEditComplete={() => setEditingNote(null)}
      />
    </div>
  )
}

const NoteCard = ({ note, onEdit, onDelete, onPin }) => {
  return (
    <Card
      className="h-full shadow-sm hover:shadow-md transition-shadow"
      actions={[
        <Button
          key="pin"
          type="text"
          icon={note.isPinned ? <PushpinFilled /> : <PushpinOutlined />}
          onClick={() => onPin(note._id, note.isPinned)}
          className={note.isPinned ? "text-blue-500" : ""}
        />,
        <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => onEdit(note)} />,
        <Button key="delete" type="text" icon={<DeleteOutlined />} onClick={() => onDelete(note._id)} danger />,
      ]}
    >
      <div className="mb-3">
        <Title level={5} className="mb-2 line-clamp-2">
          {note.title}
        </Title>
        <Text type="secondary" className="text-xs">
          {moment(note.updatedAt).fromNow()}
        </Text>
      </div>

      <div className="mb-3">
        <Text className="text-sm text-gray-600 line-clamp-3">{note.content}</Text>
      </div>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag, index) => (
            <Tag key={index} size="small" color="blue">
              {tag}
            </Tag>
          ))}
        </div>
      )}
    </Card>
  )
}

export default Notes
