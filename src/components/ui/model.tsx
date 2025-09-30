"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  children: React.ReactNode
  title: string
  description?: string
  isOpen: boolean
  onClose: () => void
  onSubmit?: () => void | Promise<void>
  submitText?: string
  cancelText?: string
  showFooter?: boolean
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "sm" | "md" | "lg" | "xl" | "full"
  className?: string
  headerIcon?: React.ReactNode
  headerVariant?: "default" | "success" | "warning" | "error" | "info"
  closeOnOverlayClick?: boolean
  loading?: boolean
  disabled?: boolean
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[95vw]"
}

const headerVariants = {
  default: {
    bg: "bg-background",
    icon: "text-foreground",
    border: "border-border"
  },
  success: {
    bg: "bg-green-50 dark:bg-green-950/20",
    icon: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800"
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    icon: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800"
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/20",
    icon: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800"
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    icon: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800"
  }
}

const defaultIcons = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: AlertCircle,
  info: Info
}

const Modal: React.FC<ModalProps> = ({
  children,
  title,
  description,
  isOpen,
  onClose,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  showFooter = true,
  submitVariant = "default",
  size = "md",
  className = '',
  headerIcon,
  headerVariant = "default",
  closeOnOverlayClick = true,
  loading = false,
  disabled = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (onSubmit && !isSubmitting && !disabled) {
      setIsSubmitting(true)
      try {
        await onSubmit()
      } catch (error) {
        console.error('Modal submit error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      onClose()
    }
  }

  const variant = headerVariants[headerVariant]
  const IconComponent = headerIcon ? null : (headerVariant !== "default" ? defaultIcons[headerVariant] : null)

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={closeOnOverlayClick ? handleOpenChange : undefined}
    >
      <DialogContent 
        className={cn(
          sizeClasses[size],
          "gap-0 p-0 overflow-hidden",
          className
        )}
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick || isSubmitting) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isSubmitting) {
            e.preventDefault()
          }
        }}
      >
        
        <DialogHeader 
          className={cn(
            "px-6 py-4 border-b",
            variant.bg,
            variant.border,
            "space-y-2"
          )}
        >
          <div className="flex items-start gap-3">
            {(headerIcon || IconComponent) && (
              <div className={cn("mt-0.5", variant.icon)}>
                {headerIcon || (IconComponent && <IconComponent className="h-5 w-5" />)}
              </div>
            )}
            <div className="flex-1 space-y-1">
              <DialogTitle className="text-lg font-semibold leading-none">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        
        
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            children
          )}
        </div>

        
        {showFooter && (
          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border flex-row justify-end gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-w-[80px]"
            >
              {cancelText}
            </Button>
            {onSubmit && (
              <Button
                variant={submitVariant}
                onClick={handleSubmit}
                disabled={isSubmitting || disabled || loading}
                className={cn(
                  "min-w-[80px]",
                  submitVariant === "default" && "bg-primary hover:bg-primary/90"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  submitText
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default Modal