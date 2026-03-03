import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useContacts, useInsertContact, useUpdateContact, useDeleteContact, Contact } from "@/hooks/useContacts";
import { useCurrentUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MessageSquare, Mail, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const priorityBorder: Record<string, string> = {
  critical: "border-l-4 border-l-[hsl(var(--crisis-red))]",
  high: "border-l-4 border-l-[hsl(var(--alert-yellow))]",
  medium: "border-l-4 border-muted-foreground",
};

const emptyForm = { name: "", role_pt: "", role_en: "", phone: "", email: "", priority: "medium" };

const ContactsSection: React.FC = () => {
  const { lang, searchQuery } = useApp();
  const { data: contacts = [], isLoading } = useContacts();
  const { data: roles = [] } = useCurrentUserRoles();
  const insertMut = useInsertContact();
  const updateMut = useUpdateContact();
  const deleteMut = useDeleteContact();

  const canEdit = roles.some(r => r === "steering_gcn" || r === "especialista_gcn");
  const canDelete = roles.includes("especialista_gcn");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = contacts.filter(c =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lang === "pt" ? c.role_pt : c.role_en).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, c) => {
    const role = (lang === "pt" ? c.role_pt : c.role_en) || (lang === "pt" ? "Sem função" : "No role");
    if (!acc[role]) acc[role] = [];
    acc[role].push(c);
    return acc;
  }, {});

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({ name: c.name, role_pt: c.role_pt, role_en: c.role_en, phone: c.phone, email: c.email, priority: c.priority });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: lang === "pt" ? "Nome obrigatório" : "Name required", variant: "destructive" });
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...form });
        toast({ title: lang === "pt" ? "Contacto atualizado" : "Contact updated" });
      } else {
        await insertMut.mutateAsync(form);
        toast({ title: lang === "pt" ? "Contacto criado" : "Contact created" });
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: lang === "pt" ? "Contacto eliminado" : "Contact deleted" });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Contactos — Linha Vermelha" : "Contacts — Red Line"}
        </h2>
        {canEdit && (
          <Button size="sm" onClick={openNew} className="h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />
            {lang === "pt" ? "Novo" : "New"}
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground animate-pulse">
          {lang === "pt" ? "A carregar..." : "Loading..."}
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {lang === "pt" ? "Sem contactos." : "No contacts."}
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([role, members]) => (
            <div key={role}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">{role}</p>
              <div className="grid gap-1.5">
                {members.map(c => (
                  <Card key={c.id} className={priorityBorder[c.priority] || ""}>
                    <CardContent className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.phone && <span className="text-foreground font-medium">{c.phone}</span>}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {c.phone && (
                          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                            <a href={`tel:${c.phone}`}><Phone className="h-4 w-4 text-[hsl(var(--ok-green))]" /></a>
                          </Button>
                        )}
                        {c.phone && (
                          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                            <a href={`sms:${c.phone}?body=${encodeURIComponent(lang === "pt" ? "URGENTE GCN: " : "URGENT BCM: ")}`}>
                              <MessageSquare className="h-4 w-4 text-[hsl(var(--alert-yellow))]" />
                            </a>
                          </Button>
                        )}
                        {c.email && (
                          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                            <a href={`mailto:${c.email}`}><Mail className="h-4 w-4" /></a>
                          </Button>
                        )}
                        {canEdit && (
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? (lang === "pt" ? "Editar Contacto" : "Edit Contact")
                : (lang === "pt" ? "Novo Contacto" : "New Contact")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>{lang === "pt" ? "Nome" : "Name"} *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{lang === "pt" ? "Função (PT)" : "Role (PT)"}</Label>
                <Input value={form.role_pt} onChange={e => set("role_pt", e.target.value)} />
              </div>
              <div>
                <Label>{lang === "pt" ? "Função (EN)" : "Role (EN)"}</Label>
                <Input value={form.role_en} onChange={e => set("role_en", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{lang === "pt" ? "Telefone" : "Phone"}</Label>
                <Input value={form.phone} onChange={e => set("phone", e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{lang === "pt" ? "Prioridade" : "Priority"}</Label>
              <Select value={form.priority} onValueChange={v => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">{lang === "pt" ? "Crítica" : "Critical"}</SelectItem>
                  <SelectItem value="high">{lang === "pt" ? "Alta" : "High"}</SelectItem>
                  <SelectItem value="medium">{lang === "pt" ? "Média" : "Medium"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {lang === "pt" ? "Cancelar" : "Cancel"}
            </Button>
            <Button onClick={handleSave} disabled={insertMut.isPending || updateMut.isPending}>
              <Check className="h-3.5 w-3.5 mr-1" />
              {lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsSection;
