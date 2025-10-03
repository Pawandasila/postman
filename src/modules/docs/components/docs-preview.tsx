"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useDocsStore } from "../store/useDocsStore";
import { toast } from "sonner";
import { format } from "date-fns";

interface DocsPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  onBack: () => void;
}

const DocsPreview = ({ isOpen, onClose, docId, onBack }: DocsPreviewProps) => {
  const { getDocById } = useDocsStore();
  const doc = getDocById(docId);

  if (!doc) {
    return null;
  }

  const generateMarkdown = () => {
    const { documentation, metadata } = doc;
    let markdown = `# ${documentation.title}\n\n`;
    markdown += `> ${documentation.summary}\n\n`;
    markdown += `**Generated:** ${format(doc.generatedAt, "PPpp")}  \n`;
    markdown += `**Created by:** ${metadata.workspaceName} / ${metadata.collectionName}\n\n`;
    markdown += `---\n\n`;

    // Description
    markdown += `## Description\n\n${documentation.description}\n\n`;

    // Endpoint
    markdown += `## Endpoint\n\n`;
    markdown += `\`\`\`\n`;
    markdown += `${documentation.endpoint.method} ${documentation.endpoint.url}\n`;
    markdown += `\`\`\`\n\n`;

    if (documentation.endpoint.baseUrl) {
      markdown += `**Base URL:** \`${documentation.endpoint.baseUrl}\`\n\n`;
    }

    // Authentication
    if (documentation.authentication) {
      markdown += `## Authentication\n\n`;
      markdown += `- **Required:** ${documentation.authentication.required ? "Yes" : "No"}\n`;
      if (documentation.authentication.type) {
        markdown += `- **Type:** ${documentation.authentication.type}\n`;
      }
      if (documentation.authentication.description) {
        markdown += `- **Description:** ${documentation.authentication.description}\n`;
      }
      markdown += `\n`;
    }

    // Headers
    markdown += `## Headers\n\n`;
    markdown += `| Header | Type | Required | Description | Example |\n`;
    markdown += `|--------|------|----------|-------------|---------|\n`;
    documentation.headers.forEach((header) => {
      markdown += `| \`${header.name}\` | ${header.type} | ${header.required ? "✓" : "-"} | ${header.description} | ${header.example || "-"} |\n`;
    });
    markdown += `\n`;

    // Query Parameters
    if (documentation.queryParameters && documentation.queryParameters.length > 0) {
      markdown += `## Query Parameters\n\n`;
      markdown += `| Parameter | Type | Required | Description | Example |\n`;
      markdown += `|-----------|------|----------|-------------|---------|\n`;
      documentation.queryParameters.forEach((param) => {
        markdown += `| \`${param.name}\` | ${param.type} | ${param.required ? "✓" : "-"} | ${param.description} | ${param.example || "-"} |\n`;
      });
      markdown += `\n`;
    }

    // Request Body
    if (documentation.requestBody) {
      markdown += `## Request Body\n\n`;
      markdown += `**Content-Type:** \`${documentation.requestBody.contentType}\`\n\n`;
      markdown += `${documentation.requestBody.description}\n\n`;
      markdown += `### Schema\n\n\`\`\`json\n${documentation.requestBody.schema}\n\`\`\`\n\n`;
      markdown += `### Example\n\n\`\`\`json\n${documentation.requestBody.example}\n\`\`\`\n\n`;
    }

    // Responses
    markdown += `## Responses\n\n`;
    documentation.responses.forEach((response) => {
      markdown += `### ${response.statusCode} - ${response.description}\n\n`;
      if (response.example) {
        markdown += `\`\`\`json\n${response.example}\n\`\`\`\n\n`;
      }
    });

    // Examples
    if (documentation.examples && documentation.examples.length > 0) {
      markdown += `## Examples\n\n`;
      documentation.examples.forEach((example, index) => {
        markdown += `### ${example.title}\n\n`;
        markdown += `${example.description}\n\n`;
        markdown += `**Request:**\n\n\`\`\`bash\n${example.request}\n\`\`\`\n\n`;
        if (example.response) {
          markdown += `**Response:**\n\n\`\`\`json\n${example.response}\n\`\`\`\n\n`;
        }
      });
    }

    // Error Codes
    if (documentation.errorCodes && documentation.errorCodes.length > 0) {
      markdown += `## Error Codes\n\n`;
      markdown += `| Code | Message | Description |\n`;
      markdown += `|------|---------|-------------|\n`;
      documentation.errorCodes.forEach((error) => {
        markdown += `| ${error.code} | ${error.message} | ${error.description} |\n`;
      });
      markdown += `\n`;
    }

    // Notes
    if (documentation.notes && documentation.notes.length > 0) {
      markdown += `## Notes\n\n`;
      documentation.notes.forEach((note) => {
        markdown += `- ${note}\n`;
      });
      markdown += `\n`;
    }

    markdown += `---\n\n`;
    markdown += `*Documentation generated by AI on ${format(doc.generatedAt, "PPpp")}*\n`;

    return markdown;
  };

  const handleDownload = () => {
    try {
      const markdown = generateMarkdown();
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-docs.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Documentation downloaded successfully!");
    } catch (error) {
      console.error("Failed to download:", error);
      toast.error("Failed to download documentation");
    }
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-green-600";
    if (code >= 300 && code < 400) return "text-blue-600";
    if (code >= 400 && code < 500) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {doc.title}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {doc.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{doc.metadata.workspaceName}</span>
                  <span>•</span>
                  <span>{doc.metadata.collectionName}</span>
                  <span>•</span>
                  <span>Created {format(new Date(doc.metadata.createdAt), "PP")}</span>
                </div>
              </div>
            </div>
            <Button onClick={handleDownload} size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download MD
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="px-6 py-6 space-y-6">
            {/* Endpoint */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Endpoint
              </h3>
              <div className="p-4 bg-muted/50 rounded-lg border font-mono">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-bold">
                    {doc.documentation.endpoint.method}
                  </Badge>
                  <code className="text-sm">{doc.documentation.endpoint.url}</code>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {doc.documentation.description}
              </p>
            </div>

            <Separator />

            {/* Headers */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Headers</h3>
              <div className="space-y-2">
                {doc.documentation.headers.map((header, idx) => (
                  <div key={idx} className="p-3 bg-card border rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <code className="text-sm font-semibold">{header.name}</code>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {header.type}
                        </Badge>
                        {header.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{header.description}</p>
                    {header.example && (
                      <code className="text-xs mt-2 block p-2 bg-muted rounded">
                        {header.example}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Query Parameters */}
            {doc.documentation.queryParameters && doc.documentation.queryParameters.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Query Parameters</h3>
                  <div className="space-y-2">
                    {doc.documentation.queryParameters.map((param, idx) => (
                      <div key={idx} className="p-3 bg-card border rounded-lg">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <code className="text-sm font-semibold">{param.name}</code>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{param.description}</p>
                        {param.example && (
                          <code className="text-xs mt-2 block p-2 bg-muted rounded">
                            {param.example}
                          </code>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Request Body */}
            {doc.documentation.requestBody && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Request Body</h3>
                  <Badge variant="secondary">{doc.documentation.requestBody.contentType}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {doc.documentation.requestBody.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">Example:</p>
                    <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                      <code>{doc.documentation.requestBody.example}</code>
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* Responses */}
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Responses</h3>
              <div className="space-y-3">
                {doc.documentation.responses.map((response, idx) => (
                  <div key={idx} className="p-4 bg-card border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-lg font-bold font-mono ${getStatusColor(response.statusCode)}`}>
                        {response.statusCode}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {response.description}
                      </span>
                    </div>
                    {response.example && (
                      <pre className="mt-3 p-3 bg-muted rounded text-xs overflow-x-auto">
                        <code>{response.example}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {doc.documentation.notes && doc.documentation.notes.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Notes</h3>
                  <ul className="space-y-2">
                    {doc.documentation.notes.map((note, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DocsPreview;
