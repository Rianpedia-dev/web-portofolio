"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string | number;
    title: string;
    slug: string;
    description: string;
    liveUrl?: string;
    githubUrl?: string;
    techStack: string[];
    category: string;
    status: string;
    isFeatured?: boolean;
    thumbnailUrl?: string;
  };
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 3D Tilt motion values
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 400, damping: 40 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), { stiffness: 400, damping: 40 });

  // Spotlight position (use state for reactivity)
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

  // Glare position
  const glareX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [mouseX, mouseY, setSpotlightPos]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  const staggerDelay = index * 0.08;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: staggerDelay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        ref={cardRef}
        className="relative"
        style={{
          perspective: 900,
          perspectiveOrigin: "50% 50%",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="relative w-full"
          style={{
            rotateX: isHovered && !isMobile ? rotateX : 0,
            rotateY: isHovered && !isMobile ? rotateY : 0,
            scale: isHovered && !isMobile ? 1.025 : 1,
            transformStyle: "preserve-3d",
            transition: isHovered ? undefined : "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Animated gradient border wrapper */}
          <div className={cn(
            "relative rounded-2xl p-[1px] transition-all duration-500",
            project.isFeatured
              ? "bg-gradient-to-br from-primary/50 via-accent/30 to-primary/50"
              : "bg-gradient-to-br from-border/40 via-border/20 to-border/40",
            isHovered && !project.isFeatured && "from-primary/40 via-accent/20 to-primary/40",
            project.isFeatured && "shadow-[0_0_30px_rgba(255,23,68,0.15)]"
          )}>
            {/* Shimmer animation on border */}
            <motion.div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              initial={false}
              animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.08)_50%,transparent_70%)]"
                animate={isHovered ? { x: ["-100%", "200%"] } : {}}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
              />
            </motion.div>

            {/* Card body */}
            <div className="relative bg-card rounded-2xl overflow-hidden flex flex-col h-full">

              {/* Spotlight overlay */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-20 rounded-2xl"
                style={{
                  background: `radial-gradient(280px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(255,23,68,0.06), transparent 40%)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered && !isMobile ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Thumbnail */}
              <div className="relative aspect-video w-full bg-secondary/60 flex items-center justify-center overflow-hidden group">
                {project.thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 scale-100 group-hover:scale-105"
                  />
                ) : (
                  <>
                    {/* Animated gradient background */}
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10" />
                      {/* Moving mesh gradient */}
                      <motion.div
                        className="absolute inset-0 opacity-40"
                        animate={isHovered ? {
                          background: [
                            "radial-gradient(ellipse at 20% 50%, rgba(255,23,68,0.15) 0%, transparent 50%)",
                            "radial-gradient(ellipse at 80% 50%, rgba(255,23,68,0.15) 0%, transparent 50%)",
                            "radial-gradient(ellipse at 20% 50%, rgba(255,23,68,0.15) 0%, transparent 50%)",
                          ]
                        } : {}}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>

                    {/* Grid pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "20px 20px",
                      }}
                    />

                    {/* Center icon with pulse */}
                    <motion.div
                      animate={isHovered ? { scale: [1, 1.15, 1.05], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Layers className="h-9 w-9 text-primary/50" />
                    </motion.div>
                  </>
                )}

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
              </div>

              {/* Content */}
              <div className="relative p-3 sm:p-5 flex flex-col flex-grow gap-2.5 sm:gap-3.5">
                {/* Title */}
                <div className="space-y-1">
                  <motion.span
                    className="text-[8px] sm:text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest flex items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: staggerDelay + 0.2, duration: 0.4 }}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {project.status.replace("_", " ")}
                  </motion.span>

                  <h3 className="font-heading text-[13px] sm:text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
                    {project.title}
                  </h3>
                </div>


                {/* Divider + Action buttons */}
                <motion.div
                  className="flex items-center gap-2.5 sm:gap-3 border-t border-border/10 pt-2.5 sm:pt-3.5 mt-0.5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: staggerDelay + 0.5, duration: 0.4 }}
                >
                  {project.liveUrl && (
                    <motion.a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] sm:text-xs font-heading font-bold tracking-wide text-primary hover:text-accent transition-colors group/link p-1"
                      whileHover={{ x: 2 }}
                    >
                      <ExternalLink className="h-3.5 w-3.5 group-hover/link:rotate-12 transition-transform" />
                      <span className="hidden sm:inline">LIVE</span>
                    </motion.a>
                  )}

                  <Link
                    href={`/projects/${project.slug}`}
                    className="ml-auto text-[11px] sm:text-xs font-heading font-bold tracking-wide text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group/detail p-1"
                  >
                    <span className="hidden sm:inline">DETAIL</span>
                    <motion.span
                      className="inline-flex"
                      animate={isHovered ? { x: [0, 3, 0] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="h-3.5 w-3.5 group-hover/detail:translate-x-0.5 transition-transform" />
                    </motion.span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Glare shine overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-30 rounded-2xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered && !isMobile ? 0.12 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%]"
              style={{
                x: glareX,
                y: glareY,
                background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 50%)",
                transform: "translate(-50%, -50%)",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
