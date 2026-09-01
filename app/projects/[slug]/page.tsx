import { PublicLayout } from "@/components/layout/PublicLayout";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { projectsData } from "@/lib/mock-data";
import { ExternalLink, ArrowLeft, Calendar, Info, Code, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicApi } from "@/lib/api";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  let projects: any[] = [];
  try {
    const res = await publicApi.getProjects();
    if (res.success && res.data) {
      projects = (res.data as any[]).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        longDescription: p.long_description || "",
        liveUrl: p.live_url || "",
        githubUrl: p.github_url || "",
        techStack: p.tech_stack || [],
        category: p.category,
        status: p.status || "completed",
        isFeatured: p.is_featured ?? false,
        startDate: p.start_date || "",
        endDate: p.end_date || "",
        thumbnailUrl: p.thumbnail_url || "",
        mobileImageUrl: p.mobile_image_url || "",
      }));
    }
  } catch (err) {
    console.error("Gagal memuat proyek dari API di halaman detail:", err);
  }

  // Fallback to static mock data if API is offline
  if (projects.length === 0) {
    projects = projectsData.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description,
      longDescription: "",
      liveUrl: p.liveUrl || "",
      githubUrl: p.githubUrl || "",
      techStack: p.techStack || [],
      category: p.category,
      status: p.status || "completed",
      isFeatured: p.isFeatured ?? false,
      startDate: p.startDate || "",
      endDate: p.endDate || "",
      thumbnailUrl: p.thumbnail || "",
      mobileImageUrl: (p as any).mobileImageUrl || "",
    }));
  }

  // Search matching project
  const currentIdx = projects.findIndex((p) => p.slug === slug);
  
  if (currentIdx === -1) {
    notFound();
  }

  const project = projects[currentIdx];

  // Navigation: Prev & Next Projects
  const prevProject = currentIdx > 0 ? projects[currentIdx - 1] : null;
  const nextProject = currentIdx < projects.length - 1 ? projects[currentIdx + 1] : null;

  // Related Projects (Same category, max 2 items)
  let relatedProjects = projects
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 2);

  // Fallback related projects if none in the same category
  if (relatedProjects.length === 0) {
    relatedProjects = projects.filter((p) => p.id !== project.id).slice(0, 2);
  }

  return (
    <PublicLayout>
      <div className="min-h-screen pt-20 pb-12 md:pt-24 md:pb-16 px-4 md:px-6 lg:px-8">
        <div className="container-custom max-w-4xl space-y-6">
          {/* Back button */}
          <div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>KEMBALI KE SEMUA PROYEK</span>
            </Link>
          </div>

          {/* Heading */}
          <SectionHeading
            title={project.title}
            subtitle={project.category + " Project • " + project.status.toUpperCase().replace("_", " ")}
            badge="Detail Proyek"
            align="left"
            className="mb-2 md:mb-3"
            staticTitle={true}
          />

          {/* Grid Details Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Visual Thumbnail Frame */}
            <div className="md:col-span-8">
              {project.mobileImageUrl ? (
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                  {/* Desktop view */}
                  <div className="relative flex-grow w-full sm:w-auto">
                    {project.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    ) : (
                      <div className="aspect-video w-full flex items-center justify-center bg-secondary/20 rounded-lg">
                        <Code className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                  </div>

                  {/* Mobile view */}
                  <div className="relative shrink-0 w-[180px] sm:w-[200px] md:w-[220px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.mobileImageUrl}
                      alt={`${project.title} Mobile`}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative w-full">
                  {project.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  ) : (
                    <div className="aspect-video w-full flex items-center justify-center bg-secondary/20 rounded-lg">
                      <Code className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Meta info card */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <GlassCard className="p-6 space-y-4 border-border/40">
                <h4 className="font-heading text-sm font-bold text-foreground">
                  Informasi Proyek
                </h4>

                <div className="space-y-3 font-sans text-xs">
                  {/* Timeline duration */}
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground/60 uppercase">Durasi Pengerjaan</p>
                      <p className="font-semibold text-foreground">
                        {project.startDate} - {project.endDate || "Present"}
                      </p>
                    </div>
                  </div>

                  {/* Status project */}
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Info className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground/60 uppercase">Status Proyek</p>
                      <p className="font-semibold text-foreground uppercase">
                        {project.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Action URLs */}
                {project.liveUrl && (
                  <div className="flex flex-col gap-2 pt-2">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <GlowButton variant="primary" size="sm" className="w-full flex justify-center items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>KUNJUNGI WEBSITE</span>
                      </GlowButton>
                    </a>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>

          {/* Description Section */}
          <div className="grid grid-cols-1 gap-6">
            <GlassCard className="p-6 md:p-8 space-y-4 border-border/40">
              <h3 className="font-heading text-base font-bold text-foreground">
                Deskripsi Lengkap
              </h3>
              <p className="text-xs md:text-sm text-gray-800 dark:text-gray-100 font-normal font-sans leading-relaxed whitespace-pre-wrap">
                {project.description}
                {"\n\n"}
                Proyek ini dirancang untuk menyelesaikan kebutuhan spesifik pengguna dengan menerapkan praktik terbaik dalam rekayasa perangkat lunak, termasuk optimalisasi beban server, kegunaan antarmuka yang tinggi (UI/UX), dan responsifitas penuh di semua perangkat pengguna.
              </p>
            </GlassCard>

            <GlassCard className="p-6 md:p-8 space-y-4 border-border/40">
              <h3 className="font-heading text-base font-bold text-foreground">
                Teknologi yang Digunakan
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech: string) => (
                  <span
                    key={tech}
                    className="text-xs font-mono text-primary font-semibold border border-primary/25 bg-primary/5 px-3.5 py-1.5 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Previous & Next Project Navigation */}
          <div className="flex items-center justify-between border-t border-b border-border/20 py-6">
            {prevProject ? (
              <Link href={`/projects/${prevProject.slug}`} className="group flex items-center gap-3 text-left">
                <div className="h-9 w-9 rounded-full border border-border group-hover:border-primary/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all">
                  <ChevronLeft className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[9px] font-mono uppercase text-muted-foreground">Sebelumnya</span>
                  <span className="font-heading text-xs font-bold text-foreground group-hover:text-primary transition-colors">{prevProject.title}</span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextProject ? (
              <Link href={`/projects/${nextProject.slug}`} className="group flex items-center gap-3 text-right">
                <div>
                  <span className="block text-[9px] font-mono uppercase text-muted-foreground">Berikutnya</span>
                  <span className="font-heading text-xs font-bold text-foreground group-hover:text-primary transition-colors">{nextProject.title}</span>
                </div>
                <div className="h-9 w-9 rounded-full border border-border group-hover:border-primary/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Related Projects Section */}
          <div className="space-y-6 pt-4">
            <h3 className="font-heading text-sm font-bold text-foreground">
              PROYEK TERKAIT
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedProjects.map((rp) => (
                <GlassCard key={rp.id} className="flex flex-col overflow-hidden border-border/40 group hover:border-primary/30">
                  <div className="relative aspect-video w-full bg-secondary/40 flex items-center justify-center overflow-hidden">
                    {rp.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={rp.thumbnailUrl}
                        alt={rp.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                        <Layers className="h-6 w-6 text-primary/30 group-hover:scale-110 transition-transform duration-500" />
                      </>
                    )}
                  </div>
                  <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {rp.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 font-sans">
                        {rp.description}
                      </p>
                    </div>
                    
                    <Link
                      href={`/projects/${rp.slug}`}
                      className="text-xs font-heading font-bold text-primary hover:text-accent flex items-center gap-1 pt-2 w-fit"
                    >
                      <span>BACA SELENGKAPNYA</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
