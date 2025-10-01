'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem
} from '@/components/ui/form'
import { RotateCcw, Copy, Check, Code, AlignLeft, FileText, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
// import { useGenerateJsonBody } from '@/modules/ai/hooks/ai-suggestion'


import { useRequestPlaygroundStore } from '../store/useRequestStore'
import { useWorkspaceStore } from '@/modules/Layout/Store'


const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { ssr: false }
)

const bodyEditorSchema = z.object({
  contentType: z.enum(['application/json', 'text/plain']),
  body: z.string().optional(),
})

type BodyEditorFormData = z.infer<typeof bodyEditorSchema>

interface BodyEditorProps {
  initialData?: {
    contentType?: 'application/json' | 'text/plain'
    body?: string
  }
  onSubmit: (data: BodyEditorFormData) => void
  className?: string
}

const BodyEditor: React.FC<BodyEditorProps> = ({
  initialData = { contentType: 'application/json', body: '' },
  onSubmit,
  className
}) => {
  const [copied, setCopied] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [prompt, setPrompt] = useState('')
  const {selectedWorkspace} = useWorkspaceStore()

  const {tabs, activeTabId} = useRequestPlaygroundStore();

//   const {mutateAsync , data , isPending , isError} = useGenerateJsonBody()

  const form = useForm<BodyEditorFormData>({
    resolver: zodResolver(bodyEditorSchema),
    defaultValues: {
      contentType: initialData.contentType || 'application/json',
      body: initialData.body || ''
    },
  })

  const contentType = form.watch('contentType')
  const bodyValue = form.watch('body')

  const handleEditorChange = (value?: string) => {
    form.setValue('body', value || '', { shouldValidate: true })
  }

  const handleCopy = async () => {
    if (bodyValue) {
      try {
        await navigator.clipboard.writeText(bodyValue)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleGenerateClick = () => {
    setShowGenerateDialog(true);
  }

//   const onGenerateBody = async (promptText: string) => {
//     try {
     
    
//       if (bodyValue) {
//         try {
//           JSON.parse(bodyValue);
//         } catch (e) {
          
//           console.log('Invalid existing JSON, generating new schema');
//         }
//       }

//       const result = await mutateAsync({
//         prompt: promptText,
//         method: tabs.find(t => t.id === activeTabId)?.method || 'POST',
//         endpoint: tabs.find(t => t.id === activeTabId)?.url || '/',
//         context: `Generate a JSON body with the following requirements: ${promptText}`,
       
//       });

//       if (result?.jsonBody) {
//         form.setValue('body', JSON.stringify(result.jsonBody, null, 2));
//       }
//       setShowGenerateDialog(false);
//       setPrompt('');
//     } catch (error) {
//       console.error('Failed to generate JSON body:', error);
//     }
//   }


  const handleFormat = () => {
    if (contentType === 'application/json' && bodyValue) {
      try {
        const formatted = JSON.stringify(JSON.parse(bodyValue), null, 2)
        form.setValue('body', formatted)
      } catch (error) {
        console.error('Invalid JSON format')
      }
    }
  }

  // Reset
  const handleReset = () => {
    form.setValue('body', '')
  }

  const contentTypeOptions = [
    {
      value: 'application/json',
      label: 'application/json',
      icon: Code,
      description: 'JSON data format'
    },
    {
      value: 'text/plain',
      label: 'text/plain',
      icon: FileText,
      description: 'Plain text format'
    }
  ]

  return (
    <div className={cn("w-full", className)}>
      <Form {...form}>
        <div className="border border-border rounded-xl overflow-hidden bg-gradient-to-br from-card/50 to-card shadow-lg">
          
          <div className="bg-muted/40 border-b border-border px-5 py-4 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full shadow-sm"></div>
                <h3 className="text-sm font-semibold text-foreground">Raw Request Body</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium">Content Type</span>
                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[200px] h-8 bg-background border-border text-xs font-medium hover:bg-accent hover:border-primary/50 transition-all rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border-border rounded-lg">
                          {contentTypeOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-xs hover:bg-accent focus:bg-accent rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                <option.icon className="h-3.5 w-3.5 text-primary" />
                                <span>{option.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contentType === 'application/json' && (
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateClick}
                  className="h-8 px-3 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-500/10 border border-green-500/30 hover:border-green-500/50 transition-all rounded-lg shadow-sm"
                  title="Generate JSON Body"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  <span className="font-medium">Generate</span>
                </Button>
              )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFormat}
                  className="h-8 px-3 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-all rounded-lg shadow-sm"
                  title="Format JSON"
                >
                  <AlignLeft className="h-3.5 w-3.5 mr-1.5" />
                  <span className="font-medium">Format</span>
                </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-border hover:border-primary/50 transition-all rounded-lg shadow-sm"
                title="Copy content"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-600 dark:text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    <span className="font-medium">Copy</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-3 text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/10 border border-destructive/30 hover:border-destructive/50 transition-all rounded-lg shadow-sm"
                title="Clear content"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                <span className="font-medium">Clear</span>
              </Button>
            </div>
          </div>

          
          <div className="relative h-80 bg-background/50">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MonacoEditor
                      height="320px"
                      value={field.value}
                      language={contentType === 'application/json' ? 'json' : 'plaintext'}
                      theme="vs-light"
                      options={{
                        automaticLayout: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: true,
                        padding: { top: 20, bottom: 20 },
                        scrollbar: {
                          vertical: 'visible',
                          horizontal: 'visible',
                          useShadows: true,
                          verticalScrollbarSize: 10,
                          horizontalScrollbarSize: 10,
                        },
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                        fontLigatures: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                      }}
                      onChange={handleEditorChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          
          <div className="bg-muted/40 border-t border-border px-5 py-3 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Lines:</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded">{bodyValue?.split('\n').length || 0}</span>
              </div>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Characters:</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded">{bodyValue?.length || 0}</span>
              </div>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500"></span>
                </span>
                <span className="text-xs text-muted-foreground font-medium">Auto-saved</span>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-8 px-4 font-semibold shadow-lg hover:shadow-primary/30 transition-all rounded-lg"
              onClick={() => form.handleSubmit(onSubmit)()}
            >
              Update Body
            </Button>
          </div>
        </div>
      </Form>

      
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Generate JSON Body</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt" className="text-foreground">What kind of JSON body do you need?</Label>
              <Input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-background border-border"
                placeholder="e.g., Create a user registration body with email and password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
            //   onClick={() => onGenerateBody(prompt)}
            //   disabled={!prompt.trim() || isPending}
              className="bg-primary hover:bg-primary/90"
            >
              
                Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BodyEditor