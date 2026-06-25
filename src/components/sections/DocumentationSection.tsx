import React, { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDocumentCategories, useDocumentFiles, useCreateDocumentFile, useDeleteDocumentFile, useUpdateDocumentFile } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, FileText, ExternalLink, Plus, Loader2 } from "lucide-react";

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

const DocumentationSection: React.FC = () => {
  const { lang } = useApp();
  const { toast } = useToast();
  const { data: categories = [], isLoading: catLoading } = useDocumentCategories();
  const { data: files = [] } = useDocumentFiles();
  const createFile = useCreateDocumentFile();
  const deleteFile = useDeleteDocumentFile();
  const updateFile = useUpdateDocumentFile();

  const [uploading, setUploading] = useState<string | null>(null);
  const [urlDialog, setUrlDialog] = useState<string | null>(null); // category_id
  const [urlValue, setUrlValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategoryId, setUploadCategoryId] = useState<string | null>(null);

  const filesByCategory = (catId: string) => files.filter((f) => f.category_id === catId);

  const handleUpload = async (categoryId: string, file: File) => {
    setUploading(categoryId);
    try {
      const ext = file.name.split(".").pop();
      const path = `${categoryId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

      await createFile.mutateAsync({
        category_id: categoryId,
        file_name: file.name,
        file_path: path,
        url: "",
      });
      toast({ title: lang === "pt" ? "Ficheiro carregado" : "File uploaded" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    try {
      if (filePath) {
        await supabase.storage.from("documents").remove([filePath]);
      }
      await deleteFile.mutateAsync(fileId);
      toast({ title: lang === "pt" ? "Eliminado" : "Deleted" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleAddUrl = async () => {
    if (!urlDialog || !urlValue.trim()) return;
    try {
      await createFile.mutateAsync({
        category_id: urlDialog,
        file_name: "",
        file_path: "",
        url: urlValue.trim(),
      });
      setUrlDialog(null);
      setUrlValue("");
      toast({ title: lang === "pt" ? "URL adicionado" : "URL added" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const getFileUrl = (f: typeof files[0]) => {
    if (f.file_path) {
      const { data } = supabase.storage.from("documents").getPublicUrl(f.file_path);
      return data.publicUrl;
    }
    return f.url;
  };

  if (catLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "Documentação GCN" : "Documentation"}
      </h2>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadCategoryId) handleUpload(uploadCategoryId, file);
          e.target.value = "";
        }}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[280px]">{lang === "pt" ? "Documentação GCN" : "Documentation"}</TableHead>
            <TableHead>{lang === "pt" ? "Documentos" : "Documents"}</TableHead>
            <TableHead className="w-[120px]">{lang === "pt" ? "Ações" : "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => {
            const catFiles = filesByCategory(cat.id);
            return (
              <TableRow key={cat.id}>
                <TableCell className="font-medium align-top">
                  {lang === "pt" ? cat.name_pt : (cat.name_en || cat.name_pt)}
                </TableCell>
                <TableCell className="align-top">
                  {catFiles.length === 0 && (
                    <span className="text-sm text-muted-foreground italic">
                      {lang === "pt" ? "Sem documentos" : "No documents"}
                    </span>
                  )}
                  <div className="space-y-1.5">
                    {catFiles.map((f) => (
                      <div key={f.id} className="flex items-center gap-2">
                        {f.file_path ? (
                          <a
                            href={getFileUrl(f)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate max-w-[300px]">{f.file_name}</span>
                          </a>
                        ) : f.url ? (
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4 shrink-0" />
                            <span className="truncate max-w-[300px]">{f.url}</span>
                          </a>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteFile(f.id, f.file_path)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={uploading === cat.id}
                      onClick={() => {
                        setUploadCategoryId(cat.id);
                        fileInputRef.current?.click();
                      }}
                    >
                      {uploading === cat.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => { setUrlDialog(cat.id); setUrlValue(""); }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* URL Dialog */}
      <Dialog open={!!urlDialog} onOpenChange={() => setUrlDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{lang === "pt" ? "Adicionar URL" : "Add URL"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="https://..."
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setUrlDialog(null)}>
                {lang === "pt" ? "Cancelar" : "Cancel"}
              </Button>
              <Button size="sm" onClick={handleAddUrl} disabled={!urlValue.trim()}>
                {lang === "pt" ? "Adicionar" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentationSection;
