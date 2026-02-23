import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, ExternalLink, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  useMeetingRooms, useCreateMeetingRoom, useUpdateMeetingRoom, useDeleteMeetingRoom,
} from "@/hooks/useMeetingRooms";
import { useToast } from "@/hooks/use-toast";

const MeetingsSection: React.FC = () => {
  const { lang } = useApp();
  const { data: rooms = [], isLoading } = useMeetingRooms();
  const createRoom = useCreateMeetingRoom();
  const updateRoom = useUpdateMeetingRoom();
  const deleteRoom = useDeleteMeetingRoom();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", platform: "", url: "" });

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", platform: "", url: "" });
    setDialogOpen(true);
  };

  const openEdit = (room: typeof rooms[0]) => {
    setEditingId(room.id);
    setForm({ name: room.name, platform: room.platform, url: room.url });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      if (editingId) {
        await updateRoom.mutateAsync({ id: editingId, ...form });
        toast({ title: lang === "pt" ? "Atualizado" : "Updated" });
      } else {
        await createRoom.mutateAsync(form);
        toast({ title: lang === "pt" ? "Criado" : "Created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRoom.mutateAsync(id);
      toast({ title: lang === "pt" ? "Eliminado" : "Deleted" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider">
          {lang === "pt" ? "Sala de Reuniões Virtuais" : "Virtual Meeting Rooms"}
        </h2>
        <Button size="sm" onClick={openCreate} className="h-8 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />
          {lang === "pt" ? "Nova" : "New"}
        </Button>
      </div>

      {rooms.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {lang === "pt" ? "Nenhuma sala configurada." : "No rooms configured."}
        </p>
      )}

      <div className="grid gap-2">
        {rooms.map(room => (
          <Card key={room.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Video className="h-4 w-4 text-ok sat-keep shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{room.name}</p>
                  {room.platform && <p className="text-xs text-muted-foreground uppercase">{room.platform}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {room.url && (
                  <Button asChild variant="secondary" size="sm" className="h-7 text-xs">
                    <a href={room.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1 sat-keep" />
                      {lang === "pt" ? "Entrar" : "Join"}
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(room)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(room.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? (lang === "pt" ? "Editar Sala" : "Edit Room")
                : (lang === "pt" ? "Nova Sala de Reunião" : "New Meeting Room")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Nome" : "Name"}</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{lang === "pt" ? "Plataforma" : "Platform"}</Label>
              <Input value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} placeholder="Teams, Zoom, Meet..." className="bg-secondary border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">URL</Label>
              <Input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className="bg-secondary border-border" />
            </div>
            <Button onClick={handleSave} disabled={!form.name.trim() || createRoom.isPending || updateRoom.isPending} className="w-full">
              {(createRoom.isPending || updateRoom.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lang === "pt" ? "Guardar" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingsSection;
