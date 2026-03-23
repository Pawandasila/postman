"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  Info,
  Shield,
  Globe,
  FileJson,
  ListFilter,
  Layers,
  BookOpen,
  AlertCircle,
  StickyNote,
  Key,
} from "lucide-react";
import { useDocsStore } from "../store/useDocsStore";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState, useCallback } from "react";

interface DocsPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  onBack: () => void;
}

const METHOD_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  GET: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
  POST: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  PUT: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  PATCH: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
  },
  DELETE: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
  },
};

const STATUS_STYLE = (code: number) => {
  if (code >= 200 && code < 300)
    return {
      badge:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
      dot: "bg-emerald-500",
    };
  if (code >= 300 && code < 400)
    return {
      badge:
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30",
      dot: "bg-blue-500",
    };
  if (code >= 400 && code < 500)
    return {
      badge:
        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30",
      dot: "bg-amber-500",
    };
  return {
    badge:
      "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30",
    dot: "bg-red-500",
  };
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-border/60">
      <div className="p-1.5 rounded-md bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

function ParamRow({
  name,
  type,
  required,
  description,
  example,
}: {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <code className="text-xs font-semibold font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
            {name}
          </code>
          {required && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-red-500">
              required
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          {type}
        </span>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
        {example && (
          <code className="text-[11px] text-muted-foreground/80 font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">
            Example: {example}
          </code>
        )}
      </div>
    </div>
  );
}

function CodeBlock({
  code,
  language = "json",
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="relative group rounded-lg border border-border/60 overflow-hidden w-full min-w-0">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/60">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
          {language}
        </span>
        <CopyButton text={code} />
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-xs font-mono bg-background leading-relaxed text-foreground/85 whitespace-pre-wrap break-all">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

const DocsPreview = ({ isOpen, onClose, docId, onBack }: DocsPreviewProps) => {
  const { getDocById } = useDocsStore();
  const doc = getDocById(docId);

  if (!doc) return null;

  const { documentation, metadata } = doc;
  const method = documentation.endpoint.method;
  const methodStyle = METHOD_STYLES[method] ?? METHOD_STYLES["GET"];

  const generateMarkdown = () => {
    let md = `# ${documentation.title}\n\n> ${documentation.summary}\n\n`;
    md += `**Generated:** ${format(doc.generatedAt, "PPpp")}  \n`;
    md += `**Workspace:** ${metadata.workspaceName} / ${metadata.collectionName}\n\n---\n\n`;
    md += `## Endpoint\n\n\`\`\`\n${method} ${documentation.endpoint.url}\n\`\`\`\n\n`;
    md += `## Description\n\n${documentation.description}\n\n`;
    if (documentation.authentication) {
      md += `## Authentication\n\n- **Required:** ${documentation.authentication.required ? "Yes" : "No"}\n`;
      if (documentation.authentication.type)
        md += `- **Type:** ${documentation.authentication.type}\n`;
      if (documentation.authentication.description)
        md += `- **Description:** ${documentation.authentication.description}\n`;
      md += "\n";
    }
    md += `## Headers\n\n| Header | Type | Required | Description | Example |\n|--------|------|----------|-------------|---------|\\n`;
    documentation.headers.forEach((h) => {
      md += `| \`${h.name}\` | ${h.type} | ${h.required ? "✓" : "-"} | ${h.description} | ${h.example ?? "-"} |\n`;
    });
    md += "\n";
    if (documentation.queryParameters?.length) {
      md += `## Query Parameters\n\n| Parameter | Type | Required | Description | Example |\n|-----------|------|----------|-------------|---------|\\n`;
      documentation.queryParameters.forEach((p) => {
        md += `| \`${p.name}\` | ${p.type} | ${p.required ? "✓" : "-"} | ${p.description} | ${p.example ?? "-"} |\n`;
      });
      md += "\n";
    }
    if (documentation.requestBody) {
      md += `## Request Body\n\n**Content-Type:** \`${documentation.requestBody.contentType}\`\n\n`;
      md += `${documentation.requestBody.description}\n\n\`\`\`json\n${documentation.requestBody.example}\n\`\`\`\n\n`;
    }
    md += `## Responses\n\n`;
    documentation.responses.forEach((r) => {
      md += `### ${r.statusCode} — ${r.description}\n\n`;
      if (r.example) md += `\`\`\`json\n${r.example}\n\`\`\`\n\n`;
    });
    if (documentation.errorCodes?.length) {
      md += `## Error Codes\n\n| Code | Message | Description |\n|------|---------|-------------|\n`;
      documentation.errorCodes.forEach((e) => {
        md += `| ${e.code} | ${e.message} | ${e.description} |\n`;
      });
      md += "\n";
    }
    if (documentation.notes?.length) {
      md += `## Notes\n\n`;
      documentation.notes.forEach((n) => {
        md += `- ${n}\n`;
      });
      md += "\n";
    }
    md += `---\n\n*Generated by AI on ${format(doc.generatedAt, "PPpp")}*\n`;
    return md;
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([generateMarkdown()], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-docs.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Documentation downloaded!");
    } catch {
      toast.error("Failed to download documentation");
    }
  };

  const hasRequest =
    documentation.headers.length > 0 ||
    (documentation.queryParameters?.length ?? 0) > 0 ||
    !!documentation.requestBody ||
    !!documentation.authentication;
  const hasResponse =
    documentation.responses.length > 0 ||
    (documentation.errorCodes?.length ?? 0) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle>Docs Preview</DialogTitle>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 gap-0 bg-background border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border/60 bg-background shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={onBack}
              className="mt-0.5 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight truncate">
                {doc.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                {documentation.summary}
              </p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-muted-foreground/70">
                  {metadata.workspaceName}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground/70">
                  {metadata.collectionName}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground/70">
                  Created {format(new Date(metadata.createdAt), "PP")}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleDownload}
            size="sm"
            className="shrink-0 gap-2 font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            Download MD
          </Button>
        </div>

        {/* Endpoint Strip */}
        <div className="px-6 py-3 border-b border-border/60 bg-muted/30 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <span
              className={`shrink-0 text-xs font-bold font-mono px-2.5 py-1 rounded-md border ${methodStyle.bg} ${methodStyle.text} ${methodStyle.border}`}
            >
              {method}
            </span>
            <code className="text-sm font-mono text-foreground/90 truncate flex-1">
              {documentation.endpoint.url}
            </code>
            <CopyButton text={documentation.endpoint.url} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="overview"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="mx-6 mt-3 mb-0 w-fit h-9 bg-muted/50 shrink-0">
            <TabsTrigger
              value="overview"
              className="text-xs gap-1.5 data-[state=active]:bg-background"
            >
              <Info className="h-3 w-3" />
              Overview
            </TabsTrigger>
            {hasRequest && (
              <TabsTrigger
                value="request"
                className="text-xs gap-1.5 data-[state=active]:bg-background"
              >
                <Globe className="h-3 w-3" />
                Request
              </TabsTrigger>
            )}
            {hasResponse && (
              <TabsTrigger
                value="response"
                className="text-xs gap-1.5 data-[state=active]:bg-background"
              >
                <Layers className="h-3 w-3" />
                Response
              </TabsTrigger>
            )}
            {(documentation.examples?.length ?? 0) > 0 && (
              <TabsTrigger
                value="examples"
                className="text-xs gap-1.5 data-[state=active]:bg-background"
              >
                <BookOpen className="h-3 w-3" />
                Examples
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="px-6 py-5 space-y-6">
                {/* Description */}
                <div className="space-y-3">
                  <SectionHeader icon={Info} title="Description" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {documentation.description}
                  </p>
                </div>

                {/* Authentication */}
                {documentation.authentication && (
                  <div className="space-y-3">
                    <SectionHeader icon={Shield} title="Authentication" />
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border/60 bg-card">
                      <div className="p-2 rounded-md bg-primary/10 shrink-0">
                        <Key className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {documentation.authentication.required
                              ? "Required"
                              : "Optional"}
                          </span>
                          {documentation.authentication.type && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-mono"
                            >
                              {documentation.authentication.type}
                            </Badge>
                          )}
                        </div>
                        {documentation.authentication.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {documentation.authentication.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {documentation.notes && documentation.notes.length > 0 && (
                  <div className="space-y-3">
                    <SectionHeader icon={StickyNote} title="Notes" />
                    <ul className="space-y-2">
                      {documentation.notes.map((note, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Request Tab */}
          {hasRequest && (
            <TabsContent
              value="request"
              className="flex-1 overflow-hidden mt-0"
            >
              <ScrollArea className="h-full">
                <div className="px-6 py-5 space-y-6">
                  {/* Headers */}
                  {documentation.headers.length > 0 && (
                    <div className="space-y-3">
                      <SectionHeader icon={ListFilter} title="Headers" />
                      <div className="rounded-lg border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
                        {documentation.headers.map((header, idx) => (
                          <ParamRow
                            key={idx}
                            name={header.name}
                            type={header.type}
                            required={header.required}
                            description={header.description}
                            example={header.example}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Query Parameters */}
                  {documentation.queryParameters &&
                    documentation.queryParameters.length > 0 && (
                      <div className="space-y-3">
                        <SectionHeader
                          icon={FileJson}
                          title="Query Parameters"
                        />
                        <div className="rounded-lg border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
                          {documentation.queryParameters.map((param, idx) => (
                            <ParamRow
                              key={idx}
                              name={param.name}
                              type={param.type}
                              required={param.required}
                              description={param.description}
                              example={param.example}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Request Body */}
                  {documentation.requestBody && (
                    <div className="space-y-3">
                      <SectionHeader icon={Globe} title="Request Body" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="font-mono text-[11px]"
                          >
                            {documentation.requestBody.contentType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {documentation.requestBody.description}
                        </p>
                        {documentation.requestBody.schema && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Schema
                            </p>
                            <CodeBlock
                              code={documentation.requestBody.schema}
                              language="json"
                            />
                          </div>
                        )}
                        {documentation.requestBody.example && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Example
                            </p>
                            <CodeBlock
                              code={documentation.requestBody.example}
                              language="json"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Response Tab */}
          {hasResponse && (
            <TabsContent
              value="response"
              className="flex-1 overflow-hidden mt-0"
            >
              <ScrollArea className="h-full">
                <div className="px-6 py-5 space-y-6">
                  {/* Responses */}
                  {documentation.responses.length > 0 && (
                    <div className="space-y-3">
                      <SectionHeader icon={Layers} title="Responses" />
                      <div className="space-y-3">
                        {documentation.responses.map((response, idx) => {
                          const style = STATUS_STYLE(response.statusCode);
                          return (
                            <div
                              key={idx}
                              className="rounded-lg border border-border/60 overflow-hidden"
                            >
                              <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30 border-b border-border/50">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-bold font-mono px-2 py-0.5 rounded ${style.badge}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                                  />
                                  {response.statusCode}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {response.description}
                                </span>
                              </div>
                              {response.example && (
                                <CodeBlock
                                  code={response.example}
                                  language="json"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Error Codes */}
                  {documentation.errorCodes &&
                    documentation.errorCodes.length > 0 && (
                      <div className="space-y-3">
                        <SectionHeader icon={AlertCircle} title="Error Codes" />
                        <div className="rounded-lg border border-border/60 overflow-hidden bg-card divide-y divide-border/50">
                          {documentation.errorCodes.map((err, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-[80px_1fr] gap-4 px-4 py-3"
                            >
                              <code className="text-xs font-bold font-mono text-red-500 self-start pt-0.5">
                                {err.code}
                              </code>
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold">
                                  {err.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {err.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Examples Tab */}
          {(documentation.examples?.length ?? 0) > 0 && (
            <TabsContent
              value="examples"
              className="flex-1 overflow-hidden mt-0"
            >
              <ScrollArea className="h-full">
                <div className="px-6 py-5 space-y-6">
                  {documentation.examples!.map((example, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">
                          {example.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {example.description}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Request
                        </p>
                        <CodeBlock code={example.request} language="bash" />
                      </div>
                      {example.response && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Response
                          </p>
                          <CodeBlock code={example.response} language="json" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocsPreview;
