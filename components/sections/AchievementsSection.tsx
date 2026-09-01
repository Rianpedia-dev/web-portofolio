"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import CardSwap, { Card, CardSwapHandle } from "@/components/ui/CardSwap";
import { achievementsData } from "@/lib/mock-data";
import { ShieldCheck, Calendar, Trophy, Award, ArrowRight, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-utils";

interface AchievementsSectionProps {
  achievements?: any[];
}

/** Animated skeleton header for each bento card */
function Skeleton({ variant }: { variant: "trophy" | "cert" | "award" }) {
  const colors = {
    trophy: { from: "from-yellow-500/20", to: "to-amber-600/5", ring: "ring-yellow-500/15", text: "text-yellow-500" },
    cert: { from: "from-blue-500/20", to: "to-indigo-600/5", ring: "ring-blue-500/15", text: "text-blue-500" },
    award: { from: "from-primary/20", to: "to-primary/5", ring: "ring-primary/15", text: "text-primary" },
  };
  const c = colors[variant];

  return (
    <div className={cn("relative flex items-center justify-center rounded-xl bg-gradient-to-br aspect-[16/9] w-full overflow-hidden border border-white/5", c.from, c.to)}>
      {/* Decorative ring */}
      <div className={cn("absolute h-24 w-24 rounded-full border-2 ring-1 opacity-20", c.ring)} />
      <div className={cn("absolute h-16 w-16 rounded-full border opacity-10", c.ring)} />

      {/* Floating dots */}
      <motion.div
        className={cn("absolute h-1.5 w-1.5 rounded-full", c.text.replace("text-", "bg-"))}
        animate={{ y: [-3, 3, -3], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "20%", left: "25%" }}
      />
      <motion.div
        className={cn("absolute h-1 w-1 rounded-full", c.text.replace("text-", "bg-"))}
        animate={{ y: [2, -4, 2], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ bottom: "25%", right: "30%" }}
      />

      {/* Icon */}
      {variant === "trophy" && <Trophy className={cn("relative z-10 h-8 w-8", c.text)} />}
      {variant === "cert" && <ShieldCheck className={cn("relative z-10 h-8 w-8", c.text)} />}
      {variant === "award" && <Award className={cn("relative z-10 h-8 w-8", c.text)} />}
    </div>
  );
}

function getVariant(title: string): "trophy" | "cert" | "award" {
  const t = title.toLowerCase();
  if (t.includes("winner") || t.includes("hackathon") || t.includes("juara")) return "trophy";
  if (t.includes("certif") || t.includes("certified") || t.includes("professional")) return "cert";
  return "award";
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardSwapRef = useRef<CardSwapHandle>(null);
  const isMobile = useIsMobile();

  const resolvedAchievements = useMemo(() =>
    (achievements && achievements.length > 0)
      ? achievements.map((item: any) => ({
          id: item.id,
          title: item.title,
          issuer: item.issuer,
          description: item.description || "",
          dateReceived: item.date_received || item.dateReceived || "",
          certificateUrl: item.certificate_url || item.certificateUrl || "",
          badgeUrl: item.badge_url || item.badgeUrl || "",
        }))
      : achievementsData,
    [achievements]
  );

  const activeAchievement = useMemo(() => 
    resolvedAchievements[activeIndex] || resolvedAchievements[0],
    [resolvedAchievements, activeIndex]
  );

  return (
    <SectionWrapper id="achievements" className="section-padding relative overflow-hidden perf-section">
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.012] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container-custom relative z-10">
        <SectionHeading
          title="Prestasi & Sertifikasi"
          subtitle="Pengakuan profesional, sertifikasi industri, dan pencapaian kompetisi yang telah saya raih."
          badge="Credentials"
          align="center"
        />

        {/* Two-column layout: Info on left, CardSwap on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-center max-w-6xl mx-auto mt-8 lg:mt-16">
          
          {/* Left Column: Details of Active Achievement */}
          <div className="lg:col-span-4 lg:pr-10 flex flex-col justify-center lg:min-h-[380px] space-y-4 lg:space-y-6 order-2 lg:order-1 px-2 lg:px-0">
            <AnimatePresence mode="wait">
              {activeAchievement && (
                <motion.div
                  key={activeAchievement.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-3 lg:space-y-5"
                >
                  {/* Category & Issuer Badge */}
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary truncate max-w-[220px]">
                      {(() => {
                        const variant = getVariant(activeAchievement.title);
                        return variant === "trophy" ? (
                          <Trophy className="h-3 w-3 shrink-0" />
                        ) : variant === "cert" ? (
                          <ShieldCheck className="h-3 w-3 shrink-0" />
                        ) : (
                          <Award className="h-3 w-3 shrink-0" />
                        );
                      })()}
                      {activeAchievement.issuer}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-xl lg:text-3xl font-extrabold text-foreground leading-snug tracking-tight line-clamp-2">
                    {activeAchievement.title}
                  </h3>

                  {/* Date received */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Calendar className="h-3 w-3" />
                    <span>Perolehan: {activeAchievement.dateReceived}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-xs sm:text-sm font-normal line-clamp-3 lg:line-clamp-none">
                    {activeAchievement.description || "Tidak ada deskripsi tersedia."}
                  </p>

                  {/* Actions & Navigation Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30 gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedAchievement(activeAchievement);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        <span>Detail Lengkap</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      {activeAchievement.certificateUrl && (
                        <a
                          href={activeAchievement.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-primary hover:text-accent transition-colors cursor-pointer"
                        >
                          <span>Verifikasi</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    
                    {/* Sleek Navigation Buttons for CardSwap */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          cardSwapRef.current?.prev();
                        }}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
                        aria-label="Previous card"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          cardSwapRef.current?.next();
                        }}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm active:scale-95"
                        aria-label="Next card"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: CardSwap Component (Larger) */}
          <div className="lg:col-span-8 relative w-full flex items-center justify-center min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] order-1 lg:order-2 overflow-visible pt-10 sm:pt-16 lg:pt-24">
            <div className="transform transition-transform duration-300 origin-center py-4 lg:py-6 w-full flex items-center justify-center">
              <CardSwap
                ref={cardSwapRef}
                cardDistance={isMobile ? 22 : 35}
                verticalDistance={isMobile ? 28 : 45}
                delay={5000}
                pauseOnHover={true}
                width={isMobile ? 300 : 540}
                height={isMobile ? 210 : 380}
                skewAmount={isMobile ? 4 : 6}
                easing="elastic"
                onActiveIndexChange={setActiveIndex}
              >
                {resolvedAchievements.map((item) => {
                  const variant = getVariant(item.title);

                  const isImageUrl = (url?: string) => {
                    if (!url) return false;
                    return (
                      url.match(/\.(jpeg|jpg|gif|png|webp|svg|avif|afif)/i) != null ||
                      url.includes("/storage/v1/object/public/")
                    );
                  };

                  const imageUrl = isImageUrl(item.badgeUrl)
                    ? item.badgeUrl
                    : isImageUrl(item.certificateUrl)
                    ? item.certificateUrl
                    : null;

                  return (
                    <Card key={item.id} className="p-4 flex flex-col gap-3 overflow-hidden shadow-xl hover:border-primary/40 transition-colors duration-300">
                      {/* Premium Header Bar (Like a window/screen mock) */}
                      <div className="flex items-center justify-between pb-2 border-b border-border/40 font-mono text-[10px] text-muted-foreground/75 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500/80" />
                          <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                          <span className="h-2 w-2 rounded-full bg-green-500/80" />
                          <span className="ml-1 font-semibold truncate max-w-[150px]">{item.issuer}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {variant === "trophy" ? (
                            <Trophy className="h-3.5 w-3.5 text-amber-500/80" />
                          ) : variant === "cert" ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-500/80" />
                          ) : (
                            <Award className="h-3.5 w-3.5 text-primary/80" />
                          )}
                        </div>
                      </div>

                      {/* Card Content - Large Preview Image / Themed Skeleton */}
                      <div className="flex-1 w-full rounded-lg overflow-hidden relative group">
                        {imageUrl ? (
                          <div className="w-full h-full bg-zinc-950/20 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                              <span className="text-[10px] font-mono text-white/90">Klik untuk melihat detail</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full">
                            <Skeleton variant={variant} />
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </CardSwap>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Popup for Details */}
      <AnimatePresence>
        {selectedAchievement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedAchievement(null)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background/95 dark:bg-zinc-950/95 p-6 shadow-2xl z-10 md:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Header Image or Skeleton */}
                <div className="overflow-hidden rounded-xl border border-border/50 bg-secondary/10">
                  {(() => {
                    const variant = getVariant(selectedAchievement.title);
                    const isImageUrl = (url?: string) => {
                      if (!url) return false;
                      return (
                        url.match(/\.(jpeg|jpg|gif|png|webp|svg|avif|afif)/i) != null ||
                        url.includes("/storage/v1/object/public/")
                      );
                    };

                    const imageUrl = isImageUrl(selectedAchievement.badgeUrl)
                      ? selectedAchievement.badgeUrl
                      : isImageUrl(selectedAchievement.certificateUrl)
                      ? selectedAchievement.certificateUrl
                      : null;

                    return imageUrl ? (
                      <div className="relative w-full aspect-video flex items-center justify-center bg-black/25">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={selectedAchievement.title}
                          className="max-h-56 w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="p-4">
                        <Skeleton variant={variant} />
                      </div>
                    );
                  })()}
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const variant = getVariant(selectedAchievement.title);
                      return variant === "trophy" ? (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      ) : variant === "cert" ? (
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Award className="h-5 w-5 text-primary" />
                      );
                    })()}
                    <span className="text-xs font-mono font-bold text-primary uppercase tracking-wide">
                      {selectedAchievement.issuer}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                    {selectedAchievement.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/75 font-mono">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Perolehan: {selectedAchievement.dateReceived}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2 font-mono">
                    Deskripsi / Pencapaian
                  </h4>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line font-normal">
                    {selectedAchievement.description || "Tidak ada deskripsi tersedia."}
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSelectedAchievement(null)}
                    className="px-4 py-2 text-xs font-mono font-bold border border-border rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    TUTUP
                  </button>
                  {selectedAchievement.certificateUrl && (
                    <a
                      href={selectedAchievement.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg transition-colors cursor-pointer"
                    >
                      <span>VERIFIKASI</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
