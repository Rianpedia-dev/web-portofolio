"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { publicApi } from "@/lib/api";
import ProfileCard from "@/components/ui/ProfileCard";
import { FloatingDock } from "@/components/ui/FloatingDock";
import { Send, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useLenis } from "@/components/providers/LenisProvider";
import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconBrandGithub,
  IconBrandTiktok,
  IconLink,
} from "@tabler/icons-react";

// Form Validation Schema using Zod
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Nama harus minimal 2 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  subject: z.string().min(3, { message: "Subjek harus minimal 3 karakter" }),
  message: z.string().min(10, { message: "Pesan harus minimal 10 karakter" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactSectionProps {
  socialLinks?: any[];
}

const getSocialIcon = (platform: string) => {
  const p = platform.toLowerCase().trim();
  switch (p) {
    case "instagram":
      return <IconBrandInstagram className="h-full w-full text-[#E4405F]" />;
    case "facebook":
      return <IconBrandFacebook className="h-full w-full text-[#1877F2]" />;
    case "whatsapp":
    case "wa":
      return <IconBrandWhatsapp className="h-full w-full text-[#25D366]" />;
    case "x":
    case "twitter":
      return <IconBrandX className="h-full w-full text-black dark:text-white" />;
    case "linkedin":
      return <IconBrandLinkedin className="h-full w-full text-[#0A66C2]" />;
    case "youtube":
      return <IconBrandYoutube className="h-full w-full text-[#FF0000]" />;
    case "github":
      return <IconBrandGithub className="h-full w-full text-[#24292e] dark:text-[#f0f6fc]" />;
    case "tiktok":
      return <IconBrandTiktok className="h-full w-full text-[#fe2c55]" />;
    default:
      return <IconLink className="h-full w-full text-muted-foreground" />;
  }
};

export function ContactSection({ socialLinks }: ContactSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lenis = useLenis();

  const resolvedSocials = useMemo(() => {
    if (socialLinks && socialLinks.length > 0) {
      return socialLinks
        .filter((link) => link.is_visible ?? link.isVisible ?? true)
        .map((link) => ({
          title: link.platform,
          icon: getSocialIcon(link.platform),
          href: link.url,
        }));
    }

    return [
      {
        title: "Instagram",
        icon: <IconBrandInstagram className="h-full w-full text-[#E4405F]" />,
        href: "https://instagram.com/",
      },
      {
        title: "Facebook",
        icon: <IconBrandFacebook className="h-full w-full text-[#1877F2]" />,
        href: "https://facebook.com/",
      },
      {
        title: "WhatsApp",
        icon: <IconBrandWhatsapp className="h-full w-full text-[#25D366]" />,
        href: "https://wa.me/",
      },
      {
        title: "X / Twitter",
        icon: <IconBrandX className="h-full w-full text-black dark:text-white" />,
        href: "https://x.com/",
      },
      {
        title: "LinkedIn",
        icon: <IconBrandLinkedin className="h-full w-full text-[#0A66C2]" />,
        href: "https://linkedin.com/in/",
      },
      {
        title: "YouTube",
        icon: <IconBrandYoutube className="h-full w-full text-[#FF0000]" />,
        href: "https://youtube.com/",
      },
      {
        title: "GitHub",
        icon: <IconBrandGithub className="h-full w-full text-[#24292e] dark:text-[#f0f6fc]" />,
        href: "https://github.com/",
      },
      {
        title: "TikTok",
        icon: <IconBrandTiktok className="h-full w-full text-[#fe2c55]" />,
        href: "https://tiktok.com/",
      },
    ];
  }, [socialLinks]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const result = await publicApi.sendContactMessage(data);
      
      if (result.success) {
        setSubmitSuccess(true);
        reset();
        // Reset success state after a few seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(result.error?.message || "Gagal mengirim pesan. Silakan coba lagi.");
      }
    } catch (err: any) {
      setSubmitError("Terjadi kesalahan jaringan. Periksa koneksi Anda dan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionWrapper id="contact" className="pt-12 md:pt-20 lg:pt-24 pb-12 md:pb-16 lg:pb-20 px-4 md:px-6 lg:px-8 relative overflow-hidden perf-section">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-crimson-glow/5 blur-[120px] rounded-full pointer-events-none hidden" />

      <div className="container-custom relative z-10">
        <SectionHeading
          title="Hubungi Saya"
          subtitle="Punya pertanyaan atau ingin berkolaborasi dalam proyek baru? Silakan kirim pesan melalui formulir di bawah ini."
          badge="Contact"
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 lg:items-stretch items-start max-w-5xl mx-auto">
          {/* Profile Card Column */}
          <div className="lg:col-span-5 flex items-center justify-center h-full w-full">
            <ProfileCard
              name="Jemi Arian"
              title="Full Stack Developer"
              handle="jemiarian"
              status="Online"
              contactText="Hubungi Saya"
              avatarUrl="/profile.avif"
              showUserInfo={false}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => {
                const formEl = document.getElementById('contact-form');
                if (formEl && lenis) {
                  lenis.scrollTo(formEl, { offset: -80, duration: 1.2 });
                } else if (formEl) {
                  formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              behindGlowColor="rgba(125, 190, 255, 0.67)"
              iconUrl="/assets/demo/iconpattern.svg"
              behindGlowEnabled
              innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
              className="w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[360px] mx-auto"
              socials={
                <FloatingDock
                  items={resolvedSocials}
                  desktopClassName="!bg-neutral-900/65 dark:!bg-neutral-900/65 !border !border-primary/50 shadow-[0_0_15px_rgba(255,23,68,0.15)]"
                  mobileClassName="mx-auto"
                />
              }
            />
          </div>

          {/* Form Column */}
          <div id="contact-form" className="lg:col-span-7 h-full w-full">
            <GlassCard className="p-4 sm:p-6 md:p-8 border-border/40 h-full flex flex-col max-w-[280px] sm:max-w-none mx-auto w-full">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-12 gap-4 h-full my-auto"
                >
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Pesan Terkirim!
                    </h3>
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-sans leading-relaxed">
                      Terima kasih telah menghubungi saya. Pesan Anda telah diterima dan akan segera saya balas melalui email yang diberikan.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col h-full justify-between">
                  {/* API Error Alert */}
                  {submitError && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-[11px] font-sans">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-[10px] font-heading font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Nama Lengkap
                    </label>
                    <Input
                      id="name"
                      placeholder="Masukkan nama Anda"
                      className="bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-lg text-xs"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-[10px] font-medium text-destructive mt-0.5 font-sans">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-[10px] font-heading font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Alamat Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contoh@domain.com"
                      className="bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-lg text-xs"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-[10px] font-medium text-destructive mt-0.5 font-sans">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-1">
                    <label htmlFor="subject" className="text-[10px] font-heading font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Subjek Pesan
                    </label>
                    <Input
                      id="subject"
                      placeholder="Apa keperluan Anda?"
                      className="bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-lg text-xs"
                      {...register("subject")}
                    />
                    {errors.subject && (
                      <p className="text-[10px] font-medium text-destructive mt-0.5 font-sans">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1 flex flex-col flex-grow">
                    <label htmlFor="message" className="text-[10px] font-heading font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Isi Pesan
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tulis pesan lengkap Anda di sini..."
                      rows={5}
                      className="bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 rounded-lg text-xs resize-none flex-grow min-h-[100px]"
                      {...register("message")}
                    />
                    {errors.message && (
                      <p className="text-[10px] font-medium text-destructive mt-0.5 font-sans">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <GlowButton
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 cursor-pointer select-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>MENGIRIM...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>KIRIM PESAN</span>
                        </>
                      )}
                    </GlowButton>
                  </div>
                </form>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
