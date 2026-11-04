-- =====================================================
-- SEED DATA: 2 diskusi contoh untuk halaman Home
-- Project: study-buddy-database
-- =====================================================

insert into public.discussions
  (title, description, tag, category, host_name, host_role, starts_at, ends_at)
values
  (
    'Fundamental UI/UX Design untuk pemula dan cara penerapannya dalam project live',
    'Belajar dasar UI/UX bersama teman komunitas dan praktik membuat desain yang lebih menarik.',
    'Diskusi', 'UI/UX', 'Fresti Herdiansyah', 'UI/UX Designer',
    date_trunc('day', now()) + interval '2 days 11 hours',
    date_trunc('day', now()) + interval '2 days 13 hours'
  ),
  (
    'Belajar Next.js dari dasar hingga membuat project pertama',
    'Kenali routing, komponen, dan cara membangun aplikasi web menggunakan Next.js.',
    'Belajar', 'Frontend', 'Andi Pratama', 'Frontend Developer',
    date_trunc('day', now()) + interval '3 days 12 hours',
    date_trunc('day', now()) + interval '3 days 14 hours'
  );

