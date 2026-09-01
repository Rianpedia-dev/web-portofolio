-- Clean up existing data (optional, for safety during re-seeding)
TRUNCATE public.site_settings, public.social_links, public.contact_messages, public.photos, public.hobbies, public.achievements, public.education, public.experience, public.project_images, public.projects, public.skills, public.about, public.profiles CASCADE;

-- Insert default admin profile (Maps to a dummy auth user, or can be linked to your own email)
-- In production, the id should match the real Auth user ID.
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@rianpedia.com', 'Rian', 'admin');

-- Seed ABOUT
INSERT INTO public.about (id, title, subtitle, bio_short, bio_full, photo_url, resume_url, location, birthdate, tagline)
VALUES (
  '10000000-0000-0000-0000-000000000000',
  'Full Stack Developer',
  'Crafting digital experiences with code & creativity',
  'Passionate developer yang membangun solusi digital inovatif dengan teknologi modern. Berpengalaman di React, Next.js, Node.js, dan cloud platforms.',
  'Saya adalah seorang Full Stack Developer dengan passion besar terhadap pengembangan web modern. Dengan pengalaman lebih dari 3 tahun, saya telah membangun berbagai macam proyek mulai dari landing page interaktif hingga aplikasi enterprise yang kompleks.

Keahlian utama saya meliputi ekosistem JavaScript/TypeScript, termasuk React, Next.js, Node.js, dan Express.js. Saya juga familiar dengan teknologi cloud seperti AWS, Vercel, dan Supabase.

Saya percaya bahwa kode yang baik bukan hanya tentang fungsionalitas, tetapi juga tentang pengalaman pengguna yang luar biasa, performa yang optimal, dan desain yang memukau.',
  '/profile.avif',
  '/resume.pdf',
  'Palembang, Indonesia',
  '1998-05-15',
  'Building the future, one line of code at a time.'
);

-- Seed SKILLS
INSERT INTO public.skills (id, name, category, proficiency, is_featured, sort_order, color) VALUES
('20000000-0000-0000-0000-000000000001', 'React.js', 'Frontend', 92, true, 1, '#61DAFB'),
('20000000-0000-0000-0000-000000000002', 'Next.js', 'Frontend', 90, true, 2, '#000000'),
('20000000-0000-0000-0000-000000000003', 'TypeScript', 'Frontend', 88, true, 3, '#3178C6'),
('20000000-0000-0000-0000-000000000004', 'Tailwind CSS', 'Frontend', 95, true, 4, '#06B6D4'),
('20000000-0000-0000-0000-000000000005', 'JavaScript', 'Frontend', 93, false, 5, '#F7DF1E'),
('20000000-0000-0000-0000-000000000006', 'HTML/CSS', 'Frontend', 96, false, 6, '#E34F26'),
('20000000-0000-0000-0000-000000000007', 'Node.js', 'Backend', 85, true, 7, '#339933'),
('20000000-0000-0000-0000-000000000008', 'Express.js', 'Backend', 82, true, 8, '#000000'),
('20000000-0000-0000-0000-000000000009', 'Python', 'Backend', 75, false, 9, '#3776AB'),
('20000000-0000-0000-0000-000000000010', 'PostgreSQL', 'Backend', 80, false, 10, '#4169E1'),
('20000000-0000-0000-0000-000000000011', 'MongoDB', 'Backend', 78, false, 11, '#47A248'),
('20000000-0000-0000-0000-000000000012', 'Supabase', 'Backend', 82, true, 12, '#3ECF8E'),
('20000000-0000-0000-0000-000000000013', 'React Native', 'Mobile', 72, false, 13, '#61DAFB'),
('20000000-0000-0000-0000-000000000014', 'Flutter', 'Mobile', 65, false, 14, '#02569B'),
('20000000-0000-0000-0000-000000000015', 'Docker', 'DevOps', 70, false, 15, '#2496ED'),
('20000000-0000-0000-0000-000000000016', 'Git & GitHub', 'Tools', 90, false, 16, '#F05032'),
('20000000-0000-0000-0000-000000000017', 'Figma', 'Tools', 78, false, 17, '#F24E1E'),
('20000000-0000-0000-0000-000000000018', 'AWS', 'DevOps', 68, false, 18, '#FF9900');

-- Seed PROJECTS
INSERT INTO public.projects (id, title, slug, description, long_description, thumbnail_url, live_url, github_url, tech_stack, category, status, is_featured, start_date, end_date, sort_order) VALUES
('30000000-0000-0000-0000-000000000001', 'E-Commerce Dashboard', 'e-commerce-dashboard', 'Full-stack e-commerce admin dashboard dengan real-time analytics, manajemen produk, dan sistem order tracking.', '## Deskripsi Proyek\nDashboard manajemen toko online canggih untuk memantau grafik penjualan secara instan.', '/images/projects/ecommerce.jpg', 'https://demo.example.com', 'https://github.com/rian/ecommerce', ARRAY['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Chart.js'], 'Web', 'completed', true, '2025-06-01', '2025-12-15', 1),
('30000000-0000-0000-0000-000000000002', 'Social Media App', 'social-media-app', 'Aplikasi media sosial dengan fitur real-time chat, post sharing, stories, dan notifikasi push.', '## Deskripsi Proyek\nAplikasi jejaring sosial mobile interaktif.', '/images/projects/social.jpg', 'https://social.example.com', 'https://github.com/rian/social', ARRAY['React Native', 'Node.js', 'Socket.io', 'MongoDB', 'Firebase'], 'Mobile', 'completed', true, '2025-01-10', '2025-05-20', 2),
('30000000-0000-0000-0000-000000000003', 'AI Content Generator', 'ai-content-generator', 'Platform AI untuk generate konten marketing, blog posts, dan copywriting dengan integrasi OpenAI GPT.', '## Deskripsi Proyek\nGenerator konten otomatis berbasis kecerdasan buatan.', '/images/projects/ai-gen.jpg', 'https://ai-gen.example.com', 'https://github.com/rian/ai-gen', ARRAY['Next.js', 'Python', 'FastAPI', 'OpenAI', 'PostgreSQL'], 'Web', 'completed', true, '2025-08-01', '2026-01-30', 3),
('30000000-0000-0000-0000-000000000004', 'Task Management API', 'task-management-api', 'RESTful API untuk manajemen proyek dan task dengan authentication, role-based access, dan real-time updates.', '## Deskripsi Proyek\nAPI tangguh untuk pengelolaan tugas proyek.', '/images/projects/task-api.jpg', '', 'https://github.com/rian/task-api', ARRAY['Express.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker'], 'API', 'completed', false, '2024-10-01', '2025-02-28', 4),
('30000000-0000-0000-0000-000000000005', 'Fitness Tracker', 'fitness-tracker', 'Aplikasi tracking kesehatan dan fitness dengan workout planner, nutrition log, dan progress visualization.', '## Deskripsi Proyek\nAplikasi mobile pemantau olahraga dan kesehatan.', '/images/projects/fitness.jpg', 'https://fit.example.com', 'https://github.com/rian/fitness', ARRAY['Flutter', 'Dart', 'Firebase', 'TensorFlow Lite'], 'Mobile', 'completed', false, '2024-06-01', '2024-11-30', 5),
('30000000-0000-0000-0000-000000000006', 'Portfolio Website', 'portfolio-website', 'Website portfolio interaktif dengan animasi 3D, dark mode, dan admin CMS untuk mengelola konten.', '## Deskripsi Proyek\nPortfolio pribadi modern interaktif.', '/images/projects/portfolio.jpg', 'https://rianpedia.com', 'https://github.com/rian/portfolio', ARRAY['Next.js', 'Three.js', 'Tailwind CSS', 'Supabase', 'Express.js'], 'Web', 'in_progress', true, '2026-06-01', NULL, 6);

-- Seed EXPERIENCE
INSERT INTO public.experience (id, type, title, company, location, description, start_date, end_date, is_current, sort_order) VALUES
('40000000-0000-0000-0000-000000000001', 'work', 'Senior Frontend Developer', 'TechCorp Indonesia', 'Jakarta, Indonesia', 'Memimpin tim frontend 5 orang, mengembangkan dashboard analytics perusahaan menggunakan Next.js dan TypeScript. Meningkatkan performa aplikasi 40% dan mengurangi bundle size 30%.', '2025-06-01', NULL, true, 1),
('40000000-0000-0000-0000-000000000002', 'work', 'Full Stack Developer', 'StartupXYZ', 'Remote', 'Membangun platform SaaS dari scratch menggunakan React, Node.js, dan PostgreSQL. Mengimplementasikan sistem payment, user management, dan real-time notifications.', '2024-01-15', '2025-05-30', false, 2),
('40000000-0000-0000-0000-000000000003', 'internship', 'Web Developer Intern', 'Digital Agency Pro', 'Bandung, Indonesia', 'Mengembangkan website klien menggunakan React dan WordPress. Belajar best practices dalam pengembangan web dan version control.', '2023-06-01', '2023-12-31', false, 3);

-- Seed EDUCATION
INSERT INTO public.education (id, institution, degree, field_of_study, start_date, end_date, is_current, description, grade, sort_order) VALUES
('50000000-0000-0000-0000-000000000001', 'Universitas Indonesia', 'S1', 'Teknik Informatika', '2020-08-01', '2024-07-31', false, 'Lulus dengan predikat Cum Laude. Aktif di komunitas developer kampus dan menjadi asisten lab pemrograman.', '3.85/4.00', 1);

-- Seed ACHIEVEMENTS
INSERT INTO public.achievements (id, title, issuer, description, date_received, certificate_url, badge_url, sort_order) VALUES
('60000000-0000-0000-0000-000000000001', 'AWS Certified Solutions Architect', 'Amazon Web Services', 'Sertifikasi profesional untuk merancang arsitektur cloud yang scalable dan reliable di AWS.', '2025-09-15', 'https://aws.amazon.com/certification', '', 1),
('60000000-0000-0000-0000-000000000002', 'Hackathon Winner — InnovateTech 2025', 'InnovateTech', 'Juara 1 hackathon nasional dengan proyek AI-powered accessibility tool untuk tunanetra.', '2025-03-20', '', '', 2),
('60000000-0000-0000-0000-000000000003', 'Google Professional Cloud Developer', 'Google Cloud', 'Sertifikasi untuk merancang, membangun, dan mengelola solusi di Google Cloud Platform.', '2024-11-10', 'https://cloud.google.com/certification', '', 3),
('60000000-0000-0000-0000-000000000004', 'Meta Frontend Developer Certificate', 'Meta (Coursera)', 'Professional certificate dalam pengembangan frontend dengan React dari Meta.', '2024-05-01', '', '', 4);

-- Seed HOBBIES
INSERT INTO public.hobbies (id, name, description, icon_name, sort_order) VALUES
('70000000-0000-0000-0000-000000000001', 'Coding', 'Membangun side projects dan berkontribusi ke open source', 'Code2', 1),
('70000000-0000-0000-0000-000000000002', 'Gaming', 'Competitive & casual gaming, game development', 'Gamepad2', 2),
('70000000-0000-0000-0000-000000000003', 'Photography', 'Street photography dan landscape', 'Camera', 3),
('70000000-0000-0000-0000-000000000004', 'Music', 'Bermain gitar dan produksi musik digital', 'Music', 4),
('70000000-0000-0000-0000-000000000005', 'Reading', 'Tech blogs, sci-fi novels, dan self-improvement', 'BookOpen', 5),
('70000000-0000-0000-0000-000000000006', 'Traveling', 'Explore tempat baru dan budaya berbeda', 'Plane', 6);

-- Seed SOCIAL LINKS
INSERT INTO public.social_links (id, platform, url, icon_name, sort_order, is_visible) VALUES
('80000000-0000-0000-0000-000000000001', 'GitHub', 'https://github.com/rian', 'Github', 1, true),
('80000000-0000-0000-0000-000000000002', 'LinkedIn', 'https://linkedin.com/in/rian', 'Linkedin', 2, true),
('80000000-0000-0000-0000-000000000003', 'Twitter', 'https://twitter.com/rian', 'Twitter', 3, true),
('80000000-0000-0000-0000-000000000004', 'Instagram', 'https://instagram.com/rian', 'Instagram', 4, true),
('80000000-0000-0000-0000-000000000005', 'YouTube', 'https://youtube.com/@rian', 'Youtube', 5, true);

-- Seed SITE SETTINGS
INSERT INTO public.site_settings (key, value, category) VALUES
('site_title', '"Rian — Full Stack Developer | RianPedia"', 'seo'),
('meta_description', '"Portfolio pribadi Rian — Full Stack Developer. Lihat proyek, skill, dan pengalaman saya."', 'seo');
