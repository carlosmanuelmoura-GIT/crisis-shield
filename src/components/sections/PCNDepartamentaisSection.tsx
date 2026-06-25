import React, { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  FileText,
  Phone,
  BarChart3,
  Building2,
  Key,
  ChevronRight,
  Search,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { usePCNDocuments, useCreatePCNDocument, useDeletePCNDocument } from "@/hooks/usePCNDocuments";
import { useDepartments, type Department } from "@/hooks/useDepartments";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

const subItemIcon: Record<string, React.ElementType> = {
  proc: FileText,
  contacts: Phone,
  cc: Key,
  bia: BarChart3,
  fornecedores: Building2,
};

const PCNDepartamentaisSection: React.FC = () => {
  const { lang } = useApp();
  const { toast } = useToast();
  const [filter, setFilter] = useState("");
  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const { data: pcnDocs = [] } = usePCNDocuments();
  const createDoc = useCreatePCNDocument();
  const deleteDoc = useDeletePCNDocument();
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ dept: string; attr: string } | null>(null);

  const filtered = departments.filter(
    (d) =>
      (d.code ?? "").toLowerCase().includes(filter.toLowerCase()) ||
      d.name.toLowerCase().includes(filter.toLowerCase())
  );

  const getSubItems = (dept: typeof departments[0]) => {
    const items = [
      { key: "proc", label: lang === "pt" ? "Procedimentos" : "Procedures" },
      { key: "contacts", label: lang === "pt" ? "Lista de Contactos" : "Contact List" },
    ];
    if (dept.hasCC) {
      items.push({ key: "cc", label: lang === "pt" ? "Lista de Acesso ao CC" : "CC Access List" });
    }
    items.push(
      { key: "bia", label: "BIA" },
      { key: "fornecedores", label: lang === "pt" ? "Fornecedores" : "Suppliers" }
    );
    return items;
  };

  const getDocsFor = (deptCode: string, attrKey: string) =>
    pcnDocs.filter(d => d.dept_code === deptCode && d.attribute_key === attrKey);

  const handleUpload = async (deptCode: string, attrKey: string, file: File) => {
    const uploadKey = `${deptCode}-${attrKey}`;
    setUploading(uploadKey);
    try {
      const ext = file.name.split(".").pop();
      const path = `pcn/${deptCode}/${attrKey}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
      if (uploadError) throw uploadError;
      await createDoc.mutateAsync({
        dept_code: deptCode,
        attribute_key: attrKey,
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

  const handleDelete = async (docId: string, filePath: string) => {
    try {
      if (filePath) await supabase.storage.from("documents").remove([filePath]);
      await deleteDoc.mutateAsync(docId);
      toast({ title: lang === "pt" ? "Eliminado" : "Deleted" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold uppercase tracking-wider">
        {lang === "pt" ? "PCN Departamentais" : "Departmental BCPs"}
      </h2>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadTarget) handleUpload(uploadTarget.dept, uploadTarget.attr, file);
          e.target.value = "";
        }}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={lang === "pt" ? "Filtrar departamentos..." : "Filter departments..."}
          className="pl-8 h-9 text-sm"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} {lang === "pt" ? "departamentos" : "departments"}
      </p>

      <div className="grid gap-2">
        {filtered.map((dept) => (
          <Collapsible key={dept.code}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger className="w-full text-left">
                <CardHeader className="p-3 flex flex-row items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors group">
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="font-mono text-xs shrink-0">
                      {dept.code}
                    </Badge>
                    <span className="text-sm font-medium truncate">{dept.name}</span>
                  </div>
                  {dept.hasCC && (
                    <Badge className="ml-auto shrink-0 text-[10px] bg-primary/10 text-primary border-0">
                      CC
                    </Badge>
                  )}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-0 border-t border-border">
                  <div className="divide-y divide-border">
                    {getSubItems(dept).map((sub) => {
                      const Icon = subItemIcon[sub.key];
                      const docs = getDocsFor(dept.code, sub.key);
                      const uploadKey = `${dept.code}-${sub.key}`;
                      const isUploading = uploading === uploadKey;

                      return (
                        <div key={sub.key} className="px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              {sub.label}
                              {docs.length > 0 && (
                                <Badge variant="secondary" className="text-[10px] h-5">{docs.length}</Badge>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              disabled={isUploading}
                              onClick={() => {
                                setUploadTarget({ dept: dept.code, attr: sub.key });
                                fileInputRef.current?.click();
                              }}
                            >
                              {isUploading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="h-3.5 w-3.5 mr-1" />
                                  Upload
                                </>
                              )}
                            </Button>
                          </div>
                          {docs.length > 0 && (
                            <div className="space-y-1 ml-6">
                              {docs.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-2">
                                  <a
                                    href={getFileUrl(doc.file_path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate"
                                  >
                                    <FileText className="h-3.5 w-3.5 shrink-0" />
                                    {doc.file_name}
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 shrink-0 text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(doc.id, doc.file_path)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default PCNDepartamentaisSection;
