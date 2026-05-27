import { useState, useEffect } from 'react'

/**
 * useLocalStorage hook to manage data persistence in localStorage for our mock UI.
 * This will handle CRUD-like operations for our cloned PharmaOS pages.
 */
export default function useLocalStorage(key, initialValue) {
  // Get initial data from localStorage or use initialValue
  const [data, setData] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Update localStorage whenever data changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  }, [key, data])

  // Helper function to add a new item
  const addItem = (item) => {
    setData(prev => [...prev, { ...item, id: Date.now().toString() }])
  }

  // Helper function to remove an item
  const removeItem = (id) => {
    setData(prev => prev.filter(item => item.id !== id))
  }

  // Helper function to update an item
  const updateItem = (id, updatedFields) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, ...updatedFields } : item))
  }

  return [data, { addItem, removeItem, updateItem, setData }]
}
