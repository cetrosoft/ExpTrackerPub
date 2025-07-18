"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSettings } from "@/contexts/settings-context"

export interface Notification {
  id: string
  title: string
  message: string
  type: "success" | "warning" | "error" | "info"
  priority: "high" | "medium" | "low"
  isRead: boolean
  createdAt: Date
}

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "isRead" | "createdAt">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { settings } = useSettings()

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem("notifications")
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }))
        setNotifications(parsedNotifications)
      }
    } catch (error) {
      console.error("Error loading notifications from localStorage:", error)
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    } catch (error) {
      console.error("Error saving notifications to localStorage:", error)
    }
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const addNotification = (notificationData: Omit<Notification, "id" | "isRead" | "createdAt">) => {
    // Check if notifications are enabled in settings
<<<<<<< HEAD
    if (!settings?.notifications?.enabled) return
=======
    if (!settings?.notifications?.enabled) {
      console.log("Notifications are disabled in settings")
      return
    }
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

    // Check specific notification type settings
    if (
      notificationData.type === "warning" &&
      notificationData.message.includes("budget") &&
      !settings?.notifications?.budgetAlerts
<<<<<<< HEAD
    )
      return
=======
    ) {
      console.log("Budget alerts are disabled in settings")
      return
    }

>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d
    if (
      notificationData.type === "error" &&
      notificationData.message.includes("budget") &&
      !settings?.notifications?.budgetAlerts
<<<<<<< HEAD
    )
      return
=======
    ) {
      console.log("Budget alerts are disabled in settings")
      return
    }
>>>>>>> b7a0cd479aae39c6c69f0c81685a6c0d3d4e4e9d

    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date(),
    }

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)) // Keep only last 50
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
