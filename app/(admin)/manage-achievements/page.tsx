"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { achievementsData } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2, Check, X, ShieldCheck, Calendar, ExternalLink, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { publicApi, adminApi } from "@/lib/api";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface AchievementItem {
  id: string;
  title: string;
  issuer: string;
  description: string;
  dateReceived: string;
  certificateUrl: string;
  badgeUrl?: string;
}

export default function ManageAchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form input states
  const [titleInput, setTitleInput] = useState("");
  const [issuerInput, setIssuerInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [certUrlInput, setCertUrlInput] = useState("");
  const [badgeUrlInput, setBadgeUrlInput] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await publicApi.getAchievements();
      if (res.success && res.data) {
        const mappedData = (res.data as any[]).map((item) => ({
          id: item.id,
          title: item.title,
          issuer: item.issuer || "",
          description: item.description || "",
          dateReceived: item.date_received || item.dateReceived || "",
          certificateUrl: item.certificate_url || item.certificateUrl || "",
          badgeUrl: item.badge_url || item.badgeUrl || "",
        }));
        setAchievements(mappedData);
      } else {
        setAchievements(achievementsData);
      }
    } catch (err: any) {
      console.error(err);
      setError("Gagal menghubungi server. Menggunakan data lokal (offline).");
      setAchievements(achievementsData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const resetForm = () => {
    setTitleInput("");
    setIssuerInput("");
    setDescriptionInput("");
    setDateInput("");
    setCertUrlInput("");
    setBadgeUrlInput("");
  };

  const startEdit = (item: AchievementItem) => {
    setEditingId(item.id);
    setTitleInput(item.title);
    setIssuerInput(item.issuer);
    setDescriptionInput(item.description);
    setDateInput(item.dateReceived);
    setCertUrlInput(item.certificateUrl);
    setBadgeUrlInput(item.badgeUrl || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const saveEdit = async (id: string) => {
    if (!titleInput.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        title: titleInput,
        issuer: issuerInput,
        description: descriptionInput,
        date_received: dateInput,
        certificate_url: certUrlInput,
        badge_url: badgeUrlInput,
      };

      const res = await adminApi.updateAchievement(id, payload);
      if (res.success) {
        setAchievements((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  title: titleInput,
                  issuer: issuerInput,
                  description: descriptionInput,
                  dateReceived: dateInput,
                  certificateUrl: certUrlInput,
                  badgeUrl: badgeUrlInput,
                }
              : item
          )
        );
        setEditingId(null);
        resetForm();
        showSuccessMsg("Prestasi berhasil diperbarui!");
      } else {
        throw new Error(res.error?.message || "Gagal memperbarui prestasi");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan perubahan ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus prestasi ini?")) return;
    setError(null);
    try {
      const res = await adminApi.deleteAchievement(id);
      if (res.success) {
        setAchievements((prev) => prev.filter((item) => item.id !== id));
        showSuccessMsg("Prestasi berhasil dihapus!");
      } else {
        throw new Error(res.error?.message || "Gagal menghapus prestasi");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghapus data dari server.");
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        title: titleInput,
        issuer: issuerInput,
        description: descriptionInput,
        date_received: dateInput,
        certificate_url: certUrlInput,
        badge_url: badgeUrlInput,
      };

      const res = await adminApi.createAchievement(payload);
      if (res.success && res.data) {
        const newItem: AchievementItem = {
          id: (res.data as any).id,
          title: titleInput,
          issuer: issuerInput,
          description: descriptionInput,
          dateReceived: dateInput,
          certificateUrl: certUrlInput,
          badgeUrl: badgeUrlInput,
        };
        setAchievements((prev) => [newItem, ...prev]);
        resetForm();
        setShowAddForm(false);
        showSuccessMsg("Prestasi baru berhasil ditambahkan!");
      } else {
        throw new Error(res.error?.message || "Gagal menambahkan prestasi");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan data ke server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            KELOLA PRESTASI
          </h1>
          <p className="text-xs text-muted-foreground font-sans">
            Tambah, perbarui, atau hapus sertifikasi dan pencapaian Anda.
          </p>
        </div>

        <GlowButton
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5 self-start sm:self-auto cursor-pointer select-none"
          onClick={() => {
            setShowAddForm(!showAddForm);
            resetForm();
          }}
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showAddForm ? "TUTUP" : "TAMBAH PRESTASI"}</span>
        </GlowButton>
      </div>

      {success && (
        <div className="p-3 text-[11px] rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 flex items-center gap-2 font-semibold font-sans">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 text-[11px] rounded-lg border border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 font-semibold font-sans">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <GlassCard className="p-6 border-primary/30 max-w-2xl">
          <form onSubmit={addItem} className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-primary">
              PRESTASI BARU
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Judul Prestasi / Sertifikasi
                </label>
                <Input
                  placeholder="Misal: AWS Certified Solutions Architect"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="bg-secondary/20 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Penerbit / Organisasi
                </label>
                <Input
                  placeholder="Misal: Amazon Web Services"
                  value={issuerInput}
                  onChange={(e) => setIssuerInput(e.target.value)}
                  className="bg-secondary/20 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Tanggal Diterima
                </label>
                <Input
                  placeholder="Misal: 2026-06-20"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="bg-secondary/20 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                  URL Badge / Lencana (opsional)
                </label>
                <Input
                  placeholder="https://..."
                  value={badgeUrlInput}
                  onChange={(e) => setBadgeUrlInput(e.target.value)}
                  className="bg-secondary/20 text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Gambar / File Sertifikat (opsional)
                </label>
                <ImageUploader
                  bucket="documents"
                  value={certUrlInput}
                  onChange={setCertUrlInput}
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Deskripsi
                </label>
                <Textarea
                  placeholder="Jelaskan tentang prestasi atau sertifikasi ini..."
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  rows={3}
                  className="bg-secondary/20 text-xs resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <GlowButton type="submit" variant="primary" size="sm" disabled={isSaving}>
                {isSaving ? "MENYIMPAN..." : "SIMPAN PRESTASI"}
              </GlowButton>
              <GlowButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                BATAL
              </GlowButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[250px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-heading tracking-wider uppercase">Memuat prestasi...</p>
        </div>
      ) : (
        /* Achievements Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((item) => (
            <GlassCard
              key={item.id}
              className="p-6 border-border/40 hover:border-primary/20 transition-all"
            >
              {editingId === item.id ? (
                // Inline Edit Mode
                <div className="space-y-3">
                  <Input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="bg-secondary/20 text-xs font-bold"
                    placeholder="Judul Prestasi"
                  />
                  <Input
                    value={issuerInput}
                    onChange={(e) => setIssuerInput(e.target.value)}
                    className="bg-secondary/20 text-xs"
                    placeholder="Penerbit"
                  />
                  <Input
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="bg-secondary/20 text-xs"
                    placeholder="Tanggal Diterima"
                  />
                  <Textarea
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    className="bg-secondary/20 text-xs resize-none"
                    rows={3}
                    placeholder="Deskripsi"
                  />
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-semibold text-muted-foreground">
                      Gambar / File Sertifikat (opsional)
                    </label>
                    <ImageUploader
                      bucket="documents"
                      value={certUrlInput}
                      onChange={setCertUrlInput}
                    />
                  </div>
                  <Input
                    value={badgeUrlInput}
                    onChange={(e) => setBadgeUrlInput(e.target.value)}
                    className="bg-secondary/20 text-xs"
                    placeholder="URL Badge / Lencana (opsional)"
                  />
                  <div className="flex justify-end gap-1.5 pt-2">
                    <ShimmerButton
                      className="p-1.5 text-emerald-500 cursor-pointer"
                      onClick={() => saveEdit(item.id)}
                      disabled={isSaving}
                      shimmerColor="#10b981"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </ShimmerButton>
                    <ShimmerButton
                      className="p-1.5 text-muted-foreground cursor-pointer"
                      onClick={cancelEdit}
                      shimmerColor="#888888"
                    >
                      <X className="h-3.5 w-3.5" />
                    </ShimmerButton>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="flex items-start gap-4">
                  {/* Icon / Certificate Image Preview */}
                  <div className="relative h-14 w-14 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-border/40 flex-shrink-0 bg-secondary/20 flex items-center justify-center">
                    {(() => {
                      const isImageUrl = (url?: string) => {
                        if (!url) return false;
                        return (
                          url.match(/\.(jpeg|jpg|gif|png|webp|svg|avif|afif)/i) != null ||
                          url.includes("/storage/v1/object/public/")
                        );
                      };

                      if (isImageUrl(item.badgeUrl)) {
                        return (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.badgeUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        );
                      }

                      if (isImageUrl(item.certificateUrl)) {
                        return (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.certificateUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        );
                      }

                      return (
                        <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(255,23,68,0.1)]">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Content */}
                  <div className="flex-grow space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h3 className="font-heading text-sm font-bold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-[10px] font-mono text-primary font-semibold uppercase tracking-wider">
                          {item.issuer}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ShimmerButton
                          className="p-1.5 text-muted-foreground cursor-pointer"
                          onClick={() => startEdit(item)}
                          shimmerColor="#888888"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </ShimmerButton>
                        <ShimmerButton
                          className="p-1.5 text-destructive cursor-pointer"
                          onClick={() => deleteItem(item.id)}
                          shimmerColor="#ef4444"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ShimmerButton>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{item.dateReceived}</span>
                    </div>

                    <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                      {item.description}
                    </p>

                    {item.certificateUrl && (
                      <a
                        href={item.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-heading font-bold text-primary hover:text-accent transition-colors"
                      >
                        <span>VERIFIKASI</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && achievements.length === 0 && (
        <div className="text-center py-16">
          <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground font-sans">
            Belum ada data prestasi yang ditambahkan.
          </p>
        </div>
      )}
    </div>
  );
}
