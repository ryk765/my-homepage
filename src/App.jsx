import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ExternalLink,
  GraduationCap,
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Tags,
  FileText,
  Image as ImageIcon,
  BookOpen,
} from "lucide-react";

const PROFILE = {
  nameJa: "陸 龍鬼",
  nameEn: "MUTSU Ryuki",
  degree: "修士(工学)（M.En.）",
  //affiliation: "佐賀大学 大学院 理工学研究科 CSIT / 山口研究室",
  //tagline: "Computer Vision / AI in Education / Systems",
};

const FALLBACK_NEWS = [
  {
    id: "n1",
    date: "2026.03.13",
    category: "その他",
    title: "ホームページ公開",
    detail: "GitHub Pages にて研究紹介サイトを公開しました",
    image: "images/HP_image.png"
  },
];

const EDUCATION = [
  { date: "2020.03", text: "和歌山県立紀北工業高等学校 電気科 卒業"},
  { date: "2022.03", text: "近畿大学工業高等専門学校 総合システム工学科 制御情報コース 卒業" },
  { date: "2024.03", text: "佐賀大学 理工学部 理工学科 知能情報システム工学コース 卒業" },
  { date: "2026.03", text: "佐賀大学 大学院 理工学研究科 博士前期課程 理工学専攻 修了" },
];

const ACHIEVEMENTS = {
  原著論文: [
  ],
  査読付き論文: [
  ],
  査読なし論文: [
  ],
  プロシーディング: [
  ],
};

const SOCIETIES = [
  "日本産業技術教育学会（JSTE）:　学生会員",
];

const CONTACT = {
  googleFormUrl: "https://forms.gle/o5KCveWbf4NHeFqR8",
};

const categories = ["すべて", "学会", "その他"];

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Badge({ children, accent = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium shadow-sm",
        accent
          ? "border-sky-200 bg-sky-100 text-sky-700"
          : "border-sky-100 bg-white text-slate-600"
      )}
    >
      {children}
    </span>
  );
}

function Card({ children, className = "", id }) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-3xl border border-sky-100 bg-white/95 p-5 shadow-[0_10px_30px_rgba(125,170,210,0.12)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="mt-0.5 rounded-2xl border border-sky-100 bg-sky-50 p-2.5 shadow-sm">
        <Icon className="h-5 w-5 text-sky-600" />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-700">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function extractBibtexField(bibtex, field) {
  if (!bibtex) return "";
  const regex = new RegExp(`${field}\\s*=\\s*[{"]([\\s\\S]*?)[}"]\\s*(,|$)`, "i");
  const match = bibtex.match(regex);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function normalizePaperNews(item) {
  if (item.category !== "業績") return item;

  if (item.doi) {
    return {
      ...item,
      title: item.title || `DOI: ${item.doi}`,
      detail:
        item.detail ||
        "DOI から参照できる論文エントリです。後で Crossref 等の API 連携に拡張できます。",
      link: item.link || `https://doi.org/${item.doi}`,
      metaType: "doi",
    };
  }

  if (item.bibtex) {
    const title = extractBibtexField(item.bibtex, "title");
    const author = extractBibtexField(item.bibtex, "author");
    const journal = extractBibtexField(item.bibtex, "journal");
    const year = extractBibtexField(item.bibtex, "year");

    return {
      ...item,
      title: item.title || title || "BibTeX 論文情報",
      detail:
        item.detail ||
        [author, journal, year].filter(Boolean).join(" / ") ||
        "BibTeX から生成した論文情報です。",
      metaType: "bibtex",
    };
  }

  return item;
}

function normalizeNewsItem(item, index) {
  const normalized = item.category === "業績" ? normalizePaperNews(item) : item;

  const imagePath = normalized.image
    ? normalized.image.startsWith("http")
      ? normalized.image
      : `${import.meta.env.BASE_URL}${normalized.image.replace(/^\/+/, "")}`
    : "";

  return {
    id: normalized.id || `news-${index}`,
    date: normalized.date || "yyyy.mm.dd",
    category: normalized.category || "その他",
    title: normalized.title || "タイトル未設定",
    detail: normalized.detail || "詳細未設定",
    image: imagePath,
    link: normalized.link || "",
    bibtex: normalized.bibtex || "",
    doi: normalized.doi || "",
    metaType: normalized.metaType || "normal",
  };
}

function NewsImage({ src, alt, compact = false }) {
  const height = compact ? "h-32" : "h-72";

  if (!src) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded-3xl border border-dashed border-sky-200 bg-sky-50 text-sky-300",
          height
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          <ImageIcon className="h-4 w-4" />
          画像なし
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-sky-100", height)}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-sky-100/40 via-white/10 to-transparent" />
    </div>
  );
}

function NewsCarousel({ items }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!items.length) return;
    if (idx > items.length - 1) setIdx(0);
  }, [items, idx]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = setInterval(() => setIdx((prev) => (prev + 1) % items.length), 4500);
    return () => clearInterval(timer);
  }, [items.length, paused]);

  const current = items[idx];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          {items.length ? (
            <span>
              <span className="font-medium text-slate-700">{idx + 1}</span>
              <span className="mx-1">/</span>
              <span>{items.length}</span>
              <span className="ml-2">（自動切替・ホバーで停止）</span>
            </span>
          ) : (
            <span>お知らせがありません</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-slate-600 shadow-sm transition hover:bg-sky-100 disabled:opacity-40"
            onClick={() => setIdx((prev) => (prev - 1 + items.length) % items.length)}
            disabled={items.length <= 1}
            aria-label="前へ"
          >
            <ChevronLeft className="h-4 w-4" />
            前へ
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-slate-600 shadow-sm transition hover:bg-sky-100 disabled:opacity-40"
            onClick={() => setIdx((prev) => (prev + 1) % items.length)}
            disabled={items.length <= 1}
            aria-label="次へ"
          >
            次へ
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {current ? (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="grid gap-5 rounded-[2rem] border border-sky-100 bg-white p-5 shadow-[0_10px_30px_rgba(125,170,210,0.12)] md:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2">
                <Badge accent>{current.category}</Badge>
                <span className="text-sm text-slate-500">{current.date}</span>
                {current.metaType === "doi" ? <Badge>DOI</Badge> : null}
                {current.metaType === "bibtex" ? <Badge>BibTeX</Badge> : null}
              </div>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-700">
                {current.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                {current.detail}
              </p>

              {(current.doi || current.bibtex) && (
                <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-3 text-xs text-slate-600">
                  <div className="mb-1 flex items-center gap-2 font-medium text-slate-700">
                    <FileText className="h-4 w-4 text-sky-600" />
                    論文メタ情報
                  </div>
                  {current.doi ? <div>DOI: {current.doi}</div> : null}
                  {current.bibtex ? <div>BibTeX 対応済み（簡易パース）</div> : null}
                </div>
              )}

              {current.link ? (
                <div className="mt-5">
                  <a
                    href={current.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600"
                  >
                    詳細を見る
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : null}
            </div>

            <div>
              <NewsImage src={current.image} alt={current.title} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-3xl border border-dashed border-sky-200 bg-white p-6 text-sm text-slate-400"
          >
            表示できるお知らせがありません。
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// function AchievementSection() {
//   return (
//     <Card id="achievement">
//       <SectionTitle
//         icon={BookOpen}
//         title="業績"
//         subtitle="原著論文・査読付き論文・査読なし論文・プロシーディング"
//       />
//       <div className="space-y-6">
//         {Object.entries(ACHIEVEMENTS).map(([category, items]) => (
//           <div key={category}>
//             <div className="mb-3 flex items-center gap-2">
//               <Badge accent>{category}</Badge>
//               <span className="text-xs text-slate-400">{items.length}件</span>
//             </div>

//             <div className="space-y-3">
//               {items.length === 0 ? (
//                 <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-400">
//                   まだ登録されていません。
//                 </div>
//               ) : (
//                 items.map((item, idx) => (
//                   <div
//                     key={`${category}-${idx}`}
//                     className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4"
//                   >
//                     <div className="text-sm font-medium leading-6 text-slate-700">
//                       {item.title}
//                     </div>
//                     <div className="mt-2 text-xs leading-6 text-slate-500">
//                       {item.authors} / {item.venue} / {item.year}
//                     </div>
//                     {(item.doi || item.pdf) && (
//                       <div className="mt-3 flex flex-wrap gap-2">
//                         {item.doi ? (
//                           <a
//                             href={`https://doi.org/${item.doi}`}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="inline-flex items-center gap-1 rounded-xl border border-sky-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-sky-50"
//                           >
//                             DOI
//                             <ExternalLink className="h-3.5 w-3.5" />
//                           </a>
//                         ) : null}
//                         {item.pdf ? (
//                           <a
//                             href={item.pdf}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="inline-flex items-center gap-1 rounded-xl border border-sky-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-sky-50"
//                           >
//                             PDF
//                             <ExternalLink className="h-3.5 w-3.5" />
//                           </a>
//                         ) : null}
//                       </div>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </Card>
//   );
// }

export default function App() {
  const [cat, setCat] = useState("すべて");
  const [newsItems, setNewsItems] = useState(FALLBACK_NEWS);

  useEffect(() => {
  let mounted = true;

  fetch(`${import.meta.env.BASE_URL}news.json`)
    .then((res) => {
      if (!res.ok) throw new Error("news.json not found");
      return res.json();
    })
    .then((data) => {
      if (!mounted) return;
      if (Array.isArray(data)) setNewsItems(data);
      else if (Array.isArray(data.news)) setNewsItems(data.news);
    })
    .catch(() => {
      if (!mounted) return;
      setNewsItems(FALLBACK_NEWS);
    });

  return () => {
    mounted = false;
  };
}, []);

  const normalizedNews = useMemo(
    () => newsItems.map((item, index) => normalizeNewsItem(item, index)),
    [newsItems]
  );

  const sortedNews = useMemo(() => {
    return [...normalizedNews].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [normalizedNews]);

  const latestTopNews = useMemo(() => sortedNews.slice(0, 4), [sortedNews]);

  const filteredNews = useMemo(() => {
    if (cat === "すべて") return sortedNews;
    return sortedNews.filter((n) => n.category === cat);
  }, [cat, sortedNews]);

  return (
    <div className="min-h-screen bg-sky-50 text-slate-700 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(186,230,253,0.45),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(240,249,255,0.9),transparent_30%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <header className="mb-8 rounded-[2rem] border border-sky-100 bg-white/90 p-6 shadow-[0_10px_30px_rgba(125,170,210,0.12)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-700 md:text-4xl">
                  {PROFILE.nameJa}
                </h1>
                <span className="text-sm text-slate-400">({PROFILE.nameEn})</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge accent>
                  <Award className="mr-1 inline h-3.5 w-3.5" />
                  {PROFILE.degree}
                </Badge>
                {/* <Badge>
                  <Building2 className="mr-1 inline h-3.5 w-3.5 text-sky-600" />
                  {PROFILE.affiliation}
                </Badge> */}
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                {PROFILE.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600"
              >
                <Mail className="h-4 w-4" />
                問い合わせ
              </a>
              <a
                href="#news"
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-sky-50"
              >
                <Newspaper className="h-4 w-4" />
                お知らせ
              </a>
              {/* <a
                href="#achievement"
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-sky-50"
              >
                <BookOpen className="h-4 w-4" />
                業績
              </a> */}
            </div>
          </div>
        </header>

        <section className="mb-8">
          <Card className="overflow-hidden">
            <SectionTitle
              icon={Newspaper}
              title="最新のお知らせ"
              //subtitle="ページ上部に最新4件をスライドショー表示"
            />
            <NewsCarousel items={latestTopNews} />
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card id="news">
              <SectionTitle
                icon={Newspaper}
                title="お知らせ"
                //subtitle="news.json から読み込み / 画像対応 / 論文は DOI・BibTeX から拡張可能"
              />

              <div className="mb-5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 p-1 shadow-sm">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCat(c)}
                      className={cn(
                        "rounded-2xl px-3 py-2 text-sm transition",
                        cat === c
                          ? "bg-sky-500 text-white"
                          : "text-slate-600 hover:bg-white hover:text-sky-600"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                  <Tags className="h-4 w-4" />
                  <span>表示：{cat}</span>
                </div>
              </div>

              <div className="space-y-4">
                {filteredNews.map((n) => (
                  <div
                    key={n.id}
                    className="grid gap-4 rounded-3xl border border-sky-100 bg-white p-4 shadow-[0_6px_20px_rgba(125,170,210,0.08)] md:grid-cols-[0.75fr_1.25fr]"
                  >
                    <NewsImage src={n.image} alt={n.title} compact />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge accent>{n.category}</Badge>
                        <span className="text-xs text-slate-400">{n.date}</span>
                        {n.metaType === "doi" ? <Badge>DOI</Badge> : null}
                        {n.metaType === "bibtex" ? <Badge>BibTeX</Badge> : null}
                      </div>

                      <div className="mt-2 text-base font-medium text-slate-700">
                        {n.title}
                      </div>
                      <div className="mt-2 text-sm leading-7 text-slate-600">
                        {n.detail}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {n.link ? (
                          <a
                            href={n.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-2xl bg-sky-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-sky-600"
                          >
                            詳細を見る
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                        {n.doi ? (
                          <span className="text-xs text-slate-400">DOI: {n.doi}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <SectionTitle
                icon={GraduationCap}
                title="学歴"
                //subtitle=""
              />
              <ol className="relative ml-2 border-l border-sky-200 pl-5">
                {EDUCATION.map((e, i) => (
                  <li key={i} className="mb-5 last:mb-0">
                    <span className="absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border border-sky-200 bg-sky-400" />
                    <div className="text-xs text-slate-400">{e.date}</div>
                    <div className="mt-1 text-sm text-slate-600">{e.text}</div>
                  </li>
                ))}
              </ol>
            </Card>

          {/* <AchievementSection /> */}

            <Card>
              <SectionTitle
                icon={Award}
                title="所属学会"
                //subtitle="所属している学会・研究会"
              />
              <ul className="space-y-2 text-sm">
                {SOCIETIES.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-sky-400" />
                    <span className="text-slate-600">{s}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card id="contact">
              <SectionTitle
                icon={Mail}
                title="問い合わせ"
                //subtitle="Google Form にひも付け"
              />
              <p className="text-sm leading-7 text-slate-600">
                フォームからご連絡ください。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={CONTACT.googleFormUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600"
                >
                  Google Form を開く
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </Card>
          </div>
        </div>

        <footer className="mt-10 border-t border-sky-100 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} {PROFILE.nameEn}.
        </footer>
      </div>
    </div>
  );
}