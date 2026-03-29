"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { createClient } from "@/lib/supabase/client";
import { getBackendUrl } from "@/lib/backend";

type StudyCourse = {
  id: string;
  code: string;
  name: string;
  creditHours: number | null;
  difficultyLevel: number | null;
  semesterId: string | null;
};

type SemesterInfo = {
  id: string;
  name: string | null;
  term: string | null;
  academic_year: string | null;
} | null;

type StudyDocument = {
  id: string;
  title: string | null;
  file_url: string | null;
  signed_url?: string | null;
  uploaded_at: string | null;
  metadata?: {
    source_type?: string | null;
    topic?: string | null;
    week?: string | null;
    lecture_number?: string | null;
  } | null;
};

type StudyConversation = {
  id: string;
  title: string;
  created_at: string;
  message_count?: number;
};

type Message = {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp?: string;
};

function termLabel(term: string | null | undefined) {
  if (term === "fall") return "Fall";
  if (term === "spring") return "Spring";
  if (term === "summer") return "Summer";
  return term ?? "Current semester";
}

function detectTextDirection(text: string): "rtl" | "ltr" {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text) ? "rtl" : "ltr";
}

function extractSourceNames(content: string): string[] {
  const marker = "المصادر المستخدمة:";
  const markerIndex = content.indexOf(marker);
  if (markerIndex === -1) return [];

  return content
    .slice(markerIndex + marker.length)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean);
}

function sourceTypeLabel(sourceType: string | null | undefined) {
  if (sourceType === "lecture") return "Lecture";
  if (sourceType === "section") return "Section";
  if (sourceType === "notes") return "Notes";
  if (sourceType === "assignment") return "Assignment";
  if (sourceType === "exam") return "Exam";
  return "Source";
}

function buildStudyConversationPrefix(courseId: string) {
  return `study::${courseId}::`;
}

function buildStudyConversationTitle(course: StudyCourse, title: string) {
  return `${buildStudyConversationPrefix(course.id)}${course.code}::${title}`;
}

function displayStudyConversationTitle(rawTitle: string, fallbackCourseCode?: string) {
  if (!rawTitle.startsWith("study::")) return rawTitle;
  const parts = rawTitle.split("::");
  return parts[3] || parts[2] || fallbackCourseCode || "Study session";
}

export default function StudyChatPage() {
  const supabase = createClient();
  const backendUrl = getBackendUrl();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [courses, setCourses] = useState<StudyCourse[]>([]);
  const [currentSemester, setCurrentSemester] = useState<SemesterInfo>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [uploadSourceType, setUploadSourceType] = useState("lecture");
  const [uploadTopic, setUploadTopic] = useState("");
  const [uploadWeek, setUploadWeek] = useState("");
  const [uploadLectureNumber, setUploadLectureNumber] = useState("");
  const [conversations, setConversations] = useState<StudyConversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<"chat" | "summary" | "quiz" | "flashcards" | "expected_questions" | "study_plan">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content:
        "## Study Chat\nارفع محاضرات المادة أو ملفات المراجعة، ثم اسألني عنها مثل NotebookLM بشكل مبسط داخل نفس المقرر.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadCourses() {
      setIsLoadingCourses(true);
      setError(null);

      try {
        const response = await fetch("/api/study/courses", { cache: "no-store" });
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.error || "Failed to load current semester courses");
        }

        setCourses(json.courses ?? []);
        setCurrentSemester(json.currentSemester ?? null);

        if (json.courses?.length) {
          setSelectedCourseId(json.courses[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load study courses");
      } finally {
        setIsLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const studyModes = useMemo(
    () => [
      { id: "chat", label: "Chat" },
      { id: "summary", label: "Summary" },
      { id: "quiz", label: "Quiz" },
      { id: "flashcards", label: "Flashcards" },
      { id: "expected_questions", label: "Expected Questions" },
      { id: "study_plan", label: "Study Plan" },
    ] as const,
    [],
  );

  const welcomeMessage = useMemo(
    () => ({
      id: `welcome-${selectedCourseId || "study"}`,
      type: "ai" as const,
      content: selectedCourse
        ? `## ${selectedCourse.code}\nهذه جلسة مذاكرة مستقلة للمادة **${selectedCourse.name}**. اختر المصادر التي تريد الاعتماد عليها ثم ابدأ بالسؤال أو اختر mode جاهز.`
        : "## Study Chat\nاختر مادة أولًا لبدء جلسة مذاكرة مستقلة.",
      timestamp: new Date().toLocaleTimeString(),
    }),
    [selectedCourse, selectedCourseId],
  );

  useEffect(() => {
    async function loadDocuments() {
      if (!selectedCourse) {
        setDocuments([]);
        return;
      }

      setIsLoadingDocuments(true);
      setError(null);

      try {
        const response = await authorizedFetch(
          `${backendUrl}/api/study-materials?course_id=${encodeURIComponent(selectedCourse.id)}`,
          { method: "GET" },
        );

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.detail || "Failed to load study materials");
        }

        setDocuments(payload.documents ?? []);
        setSelectedDocumentIds((payload.documents ?? []).map((item: StudyDocument) => item.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load study materials");
      } finally {
        setIsLoadingDocuments(false);
      }
    }

    void loadDocuments();
  }, [backendUrl, selectedCourse, supabase]);

  useEffect(() => {
    async function loadCourseConversations() {
      if (!selectedCourse) {
        setConversations([]);
        setConversationId(null);
        setMessages([welcomeMessage]);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const prefix = `${buildStudyConversationPrefix(selectedCourse.id)}%`;
      const { data: convs } = await supabase
        .from("conversations")
        .select(`
          id,
          title,
          created_at,
          messages(count)
        `)
        .eq("user_id", user.id)
        .like("title", prefix)
        .order("created_at", { ascending: false });

      const mapped = ((convs as StudyConversation[]) ?? []).map((conv: any) => ({
        id: String(conv.id),
        title: String(conv.title),
        created_at: String(conv.created_at),
        message_count: Array.isArray(conv.messages) ? conv.messages[0]?.count : conv.message_count,
      }));

      setConversations(mapped);

      if (mapped.length > 0) {
        setConversationId(mapped[0].id);
        await loadMessages(mapped[0].id);
        return;
      }

      await createNewConversation(selectedCourse, user.id);
    }

    void loadCourseConversations();
  }, [selectedCourse, supabase, welcomeMessage]);

  const quickPrompts = useMemo(() => {
    if (!selectedCourse) return [];

    return [
      `لخصلي أهم الأفكار في محاضرات ${selectedCourse.code}`,
      `اشرحلي أبسط شرح للنقاط الأساسية في ${selectedCourse.name}`,
      `اعمللي quiz قصير من الملفات المرفوعة في ${selectedCourse.code}`,
      `استخرج أهم الأسئلة المتوقعة من محاضرات ${selectedCourse.name}`,
    ];
  }, [selectedCourse]);

  async function createNewConversation(course: StudyCourse, userId: string) {
    const { data: newConv } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: userId,
          title: buildStudyConversationTitle(course, "New study session"),
          created_at: new Date().toISOString(),
        },
      ])
      .select("id, title, created_at")
      .single();

    if (newConv) {
      const conversation = {
        id: String(newConv.id),
        title: String(newConv.title),
        created_at: String(newConv.created_at),
        message_count: 0,
      };
      setConversationId(conversation.id);
      setConversations((prev) => [conversation, ...prev]);
      setMessages([welcomeMessage]);
    }
  }

  async function loadMessages(convId: string) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (msgs && msgs.length > 0) {
      setMessages(
        msgs.map((msg: any) => ({
          id: String(msg.id),
          type: msg.role === "user" ? "user" : "ai",
          content: String(msg.content ?? ""),
          timestamp: new Date(msg.created_at).toLocaleTimeString(),
        })),
      );
    } else {
      setMessages([welcomeMessage]);
    }
  }

  async function getAccessToken(forceRefresh = false) {
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (forceRefresh) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) return null;
      return data.session?.access_token ?? null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) return null;
      return data.session?.access_token ?? null;
    }

    if (session.expires_at && session.expires_at <= nowInSeconds + 60) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) return session.access_token ?? null;
      return data.session?.access_token ?? session.access_token ?? null;
    }

    return session.access_token ?? null;
  }

  async function authorizedFetch(input: string, init: RequestInit = {}) {
    const firstToken = await getAccessToken();
    if (!firstToken) {
      throw new Error("Missing Supabase access token");
    }

    const firstResponse = await fetch(input, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${firstToken}`,
      },
    });

    if (firstResponse.status !== 401) {
      return firstResponse;
    }

    const refreshedToken = await getAccessToken(true);
    if (!refreshedToken) {
      return firstResponse;
    }

    return fetch(input, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        Authorization: `Bearer ${refreshedToken}`,
      },
    });
  }

  async function refreshDocuments() {
    if (!selectedCourse) return;

    const response = await authorizedFetch(
      `${backendUrl}/api/study-materials?course_id=${encodeURIComponent(selectedCourse.id)}`,
      { method: "GET" },
    );

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.detail || "Failed to load study materials");
    }

    setDocuments(payload.documents ?? []);
    setSelectedDocumentIds((payload.documents ?? []).map((item: StudyDocument) => item.id));
  }

  async function handleNewStudySession() {
    if (!selectedCourse) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await createNewConversation(selectedCourse, user.id);
  }

  async function handleSelectConversation(convId: string) {
    setConversationId(convId);
    await loadMessages(convId);
  }

  async function handleDeleteConversation(convId: string) {
    if (!confirm("Delete this study session for the selected course?")) {
      return;
    }

    await supabase.from("messages").delete().eq("conversation_id", convId);
    await supabase.from("conversations").delete().eq("id", convId);

    const remaining = conversations.filter((item) => item.id !== convId);
    setConversations(remaining);

    if (convId === conversationId) {
      if (remaining.length > 0) {
        setConversationId(remaining[0].id);
        await loadMessages(remaining[0].id);
      } else if (selectedCourse) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await createNewConversation(selectedCourse, user.id);
        }
      }
    }
  }

  function toggleDocumentSelection(documentId: string) {
    setSelectedDocumentIds((prev) =>
      prev.includes(documentId)
        ? prev.filter((item) => item !== documentId)
        : [...prev, documentId],
    );
  }

  function selectAllDocuments() {
    setSelectedDocumentIds(documents.map((item) => item.id));
  }

  function clearDocumentSelection() {
    setSelectedDocumentIds([]);
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !selectedCourse) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("course_id", selectedCourse.id);
      formData.append("course_code", selectedCourse.code);
      formData.append("course_name", selectedCourse.name);
      formData.append("source_type", uploadSourceType);
      if (uploadTopic.trim()) {
        formData.append("topic", uploadTopic.trim());
      }
      if (uploadWeek.trim()) {
        formData.append("week", uploadWeek.trim());
      }
      if (uploadLectureNumber.trim()) {
        formData.append("lecture_number", uploadLectureNumber.trim());
      }
      formData.append("file", file);

      const response = await authorizedFetch(`${backendUrl}/api/study-materials/upload`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.detail || "Failed to upload study material");
      }

      await refreshDocuments();
      setMessages((prev) => [
        ...prev,
        {
          id: `upload-${Date.now()}`,
          type: "ai",
          content: `تمت إضافة الملف **${payload.title ?? file.name}** إلى مكتبة ${selectedCourse.code}. يمكنك الآن سؤالي عنه مباشرة.`,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }
      setUploadTopic("");
      setUploadWeek("");
      setUploadLectureNumber("");
    }
  }

  async function handleDeleteDocument(documentId: string) {
    if (!confirm("Delete this study material from the selected course library?")) {
      return;
    }

    setError(null);

    try {
      const response = await authorizedFetch(`${backendUrl}/api/study-materials/${documentId}`, {
        method: "DELETE",
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.detail || "Failed to delete study material");
      }

      await refreshDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete study material");
    }
  }

  async function handleSend() {
    if (!input.trim() || !selectedCourse || !conversationId || isSending) return;

    const question = input.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: question,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const { data: savedUserMsg } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            role: "user",
            content: question,
          },
        ])
        .select("id, created_at")
        .single();

      if (savedUserMsg) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? {
                  ...msg,
                  id: String(savedUserMsg.id),
                  timestamp: new Date(savedUserMsg.created_at).toLocaleTimeString(),
                }
              : msg,
          ),
        );
      }

      const response = await authorizedFetch(`${backendUrl}/api/ask`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          context_mode: "study",
          course_id: selectedCourse.id,
          course_code: selectedCourse.code,
          course_name: selectedCourse.name,
          selected_document_ids: selectedDocumentIds.length > 0 ? selectedDocumentIds : null,
          study_mode: studyMode,
          conversation_id: conversationId,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.answer || payload?.detail || "Study chat request failed");
      }

      const aiContent = String(payload?.answer ?? "No answer returned.");
      const tempAiId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: tempAiId,
          type: "ai",
          content: aiContent,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      const { data: savedAiMsg } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            role: "ai",
            content: aiContent,
          },
        ])
        .select("id, created_at")
        .single();

      if (savedAiMsg) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAiId
              ? {
                  ...msg,
                  id: String(savedAiMsg.id),
                  timestamp: new Date(savedAiMsg.created_at).toLocaleTimeString(),
                }
              : msg,
          ),
        );
      }

      if (messages.length <= 1) {
        const nextTitle = buildStudyConversationTitle(
          selectedCourse,
          question.slice(0, 36) + (question.length > 36 ? "..." : ""),
        );
        await supabase.from("conversations").update({ title: nextTitle }).eq("id", conversationId);
        setConversations((prev) =>
          prev.map((conv) => (conv.id === conversationId ? { ...conv, title: nextTitle } : conv)),
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء إرسال السؤال.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: "ai",
          content: `حدث خطأ أثناء تجهيز الإجابة.\n\n${message}`,
        },
      ]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-[28px] border border-[#DAC0A3]/30 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,44,87,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#102C57]/6 px-3 py-1 text-xs font-semibold text-[#102C57]">
              <Sparkles className="h-3.5 w-3.5" />
              Notebook-style study workspace
            </div>
            <h1 className="text-3xl font-bold text-[#102C57]">Study Chat</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#102C57]/70">
              اختر مادة من مواد السمستر الحالي، ارفع المحاضرات أو ملفات المراجعة الخاصة بها،
              ثم اسأل الشات ليشرح أو يلخص أو يختبرك اعتمادًا على تلك الملفات فقط.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DAC0A3]/25 bg-[#F8F0E5] px-4 py-3 text-sm text-[#102C57]">
            <div className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-4 w-4" />
              <span>{currentSemester?.name ?? "Current Semester"}</span>
            </div>
            <p className="mt-1 text-xs text-[#102C57]/60">
              {currentSemester
                ? `${termLabel(currentSemester.term)} ${currentSemester.academic_year ?? ""}`.trim()
                : "Your current-semester courses will appear here."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-[24px] border border-[#DAC0A3]/30 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#102C57]">جلسات المادة</h2>
                <p className="text-xs text-[#102C57]/55">كل مادة لها history مستقل وجلسات منفصلة.</p>
              </div>
              <button
                type="button"
                onClick={() => void handleNewStudySession()}
                disabled={!selectedCourse}
                className="rounded-xl bg-[#102C57] px-3 py-2 text-xs font-semibold text-[#F8F0E5] disabled:opacity-50"
              >
                New Session
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DAC0A3]/35 bg-[#FCFAF7] px-4 py-4 text-sm text-[#102C57]/60">
                لا توجد جلسات لهذه المادة بعد.
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => {
                  const active = conv.id === conversationId;
                  return (
                    <div
                      key={conv.id}
                      className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-3 ${
                        active
                          ? "border-[#102C57] bg-[#102C57] text-[#F8F0E5]"
                          : "border-[#DAC0A3]/25 bg-[#FCFAF7] text-[#102C57]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void handleSelectConversation(conv.id)}
                        className="min-w-0 flex-1 text-right"
                      >
                        <div className="truncate text-sm font-medium">
                          {displayStudyConversationTitle(conv.title, selectedCourse?.code)}
                        </div>
                        <div className={`mt-1 text-[11px] ${active ? "text-[#F8F0E5]/70" : "text-[#102C57]/45"}`}>
                          {new Date(conv.created_at).toLocaleDateString()} {conv.message_count ? `• ${conv.message_count} msgs` : ""}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteConversation(conv.id)}
                        className={`rounded-lg border p-2 ${
                          active
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-red-200 bg-white text-red-500"
                        }`}
                        title="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-[#DAC0A3]/30 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#102C57]">مواد السمستر الحالي</h2>
                <p className="text-xs text-[#102C57]/55">اختر المادة التي تريد بناء مكتبة مذاكرة لها.</p>
              </div>
              <span className="rounded-full bg-[#102C57]/6 px-2.5 py-1 text-xs font-semibold text-[#102C57]">
                {courses.length}
              </span>
            </div>

            {isLoadingCourses ? (
              <div className="flex items-center gap-2 rounded-2xl bg-[#F8F0E5] px-4 py-5 text-sm text-[#102C57]/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري تحميل موادك الحالية...</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DAC0A3]/40 bg-[#F8F0E5]/70 px-4 py-5 text-sm text-[#102C57]/70">
                لا توجد مواد بحالة <code>current</code> في بياناتك الآن.
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => {
                  const active = course.id === selectedCourseId;

                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`w-full rounded-2xl border px-4 py-4 text-right transition-all ${
                        active
                          ? "border-[#102C57] bg-[#102C57] text-[#F8F0E5] shadow-lg shadow-[#102C57]/20"
                          : "border-[#DAC0A3]/30 bg-[#FCFAF7] text-[#102C57] hover:border-[#102C57]/35 hover:bg-[#F8F0E5]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{course.code}</div>
                          <div className={`mt-1 text-xs leading-6 ${active ? "text-[#F8F0E5]/80" : "text-[#102C57]/65"}`}>
                            {course.name}
                          </div>
                          <div className={`mt-3 text-[11px] ${active ? "text-[#F8F0E5]/70" : "text-[#102C57]/50"}`}>
                            {course.creditHours ?? "-"} credit hours
                          </div>
                        </div>
                        {active ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-[#DAC0A3]/30 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#102C57]">مكتبة المادة</h2>
                <p className="text-xs text-[#102C57]/55">
                  ارفع ملفات PDF أو Markdown أو TXT لتصبح مصدر الشرح داخل الشات.
                </p>
              </div>
              <span className="rounded-full bg-[#102C57]/6 px-2.5 py-1 text-xs font-semibold text-[#102C57]">
                {documents.length}
              </span>
            </div>

            <input
              ref={uploadInputRef}
              type="file"
              accept=".pdf,.md,.markdown,.txt"
              className="hidden"
              onChange={handleUpload}
            />

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[11px] font-medium text-[#102C57]/60">Source type</span>
                <select
                  value={uploadSourceType}
                  onChange={(event) => setUploadSourceType(event.target.value)}
                  className="w-full rounded-2xl border border-[#DAC0A3]/30 bg-[#FCFAF7] px-3 py-2 text-sm text-[#102C57] outline-none"
                >
                  <option value="lecture">Lecture</option>
                  <option value="section">Section</option>
                  <option value="notes">Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-medium text-[#102C57]/60">Topic</span>
                <input
                  type="text"
                  value={uploadTopic}
                  onChange={(event) => setUploadTopic(event.target.value)}
                  placeholder="Neural networks, DB basics..."
                  className="w-full rounded-2xl border border-[#DAC0A3]/30 bg-[#FCFAF7] px-3 py-2 text-sm text-[#102C57] outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-medium text-[#102C57]/60">Week</span>
                <input
                  type="text"
                  value={uploadWeek}
                  onChange={(event) => setUploadWeek(event.target.value)}
                  placeholder="Week 3"
                  className="w-full rounded-2xl border border-[#DAC0A3]/30 bg-[#FCFAF7] px-3 py-2 text-sm text-[#102C57] outline-none"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-medium text-[#102C57]/60">Lecture no.</span>
                <input
                  type="text"
                  value={uploadLectureNumber}
                  onChange={(event) => setUploadLectureNumber(event.target.value)}
                  placeholder="1"
                  className="w-full rounded-2xl border border-[#DAC0A3]/30 bg-[#FCFAF7] px-3 py-2 text-sm text-[#102C57] outline-none"
                />
              </label>
            </div>

            <button
              type="button"
              disabled={!selectedCourse || isUploading}
              onClick={() => uploadInputRef.current?.click()}
              className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#102C57]/30 bg-[#F8F0E5] px-4 py-3 text-sm font-medium text-[#102C57] transition hover:bg-[#efe3d2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{isUploading ? "Uploading..." : "Upload lecture or notes"}</span>
            </button>

            {documents.length > 0 ? (
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllDocuments}
                  className="rounded-full bg-[#F8F0E5] px-3 py-1 text-[11px] font-medium text-[#102C57]"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={clearDocumentSelection}
                  className="rounded-full bg-[#F8F0E5] px-3 py-1 text-[11px] font-medium text-[#102C57]"
                >
                  Clear
                </button>
                <span className="text-[11px] text-[#102C57]/45">
                  {selectedDocumentIds.length} selected
                </span>
              </div>
            ) : null}

            {isLoadingDocuments ? (
              <div className="flex items-center gap-2 rounded-2xl bg-[#FCFAF7] px-4 py-4 text-sm text-[#102C57]/65">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري تحميل مكتبة المادة...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DAC0A3]/35 bg-[#FCFAF7] px-4 py-5 text-sm text-[#102C57]/65">
                لا توجد ملفات مرفوعة لهذه المادة بعد. ارفع أول محاضرة لتبدأ تجربة الشرح والتلخيص.
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-[#DAC0A3]/20 bg-[#FCFAF7] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#102C57]">
                        <input
                          type="checkbox"
                          checked={selectedDocumentIds.includes(document.id)}
                          onChange={() => toggleDocumentSelection(document.id)}
                          className="h-4 w-4 rounded border-[#DAC0A3]"
                        />
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{document.title ?? "Untitled file"}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#102C57]/45">
                        {document.uploaded_at
                          ? new Date(document.uploaded_at).toLocaleString()
                          : "Recently uploaded"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#F8F0E5] px-2.5 py-1 text-[10px] font-medium text-[#102C57]">
                          {sourceTypeLabel(document.metadata?.source_type)}
                        </span>
                        {document.metadata?.lecture_number ? (
                          <span className="rounded-full bg-[#F8F0E5] px-2.5 py-1 text-[10px] font-medium text-[#102C57]">
                            Lecture {document.metadata.lecture_number}
                          </span>
                        ) : null}
                        {document.metadata?.week ? (
                          <span className="rounded-full bg-[#F8F0E5] px-2.5 py-1 text-[10px] font-medium text-[#102C57]">
                            {document.metadata.week}
                          </span>
                        ) : null}
                        {document.metadata?.topic ? (
                          <span className="rounded-full bg-[#F8F0E5] px-2.5 py-1 text-[10px] font-medium text-[#102C57]">
                            {document.metadata.topic}
                          </span>
                        ) : null}
                      </div>
                      {document.signed_url ? (
                        <a
                          href={document.signed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#102C57] underline underline-offset-2"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Open source</span>
                        </a>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteDocument(document.id)}
                      className="rounded-lg border border-red-200 bg-white p-2 text-red-500 transition hover:bg-red-50"
                      title="Delete source"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="flex min-h-[720px] flex-col rounded-[24px] border border-[#DAC0A3]/30 bg-white shadow-sm">
          <div className="border-b border-[#DAC0A3]/20 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#102C57]">
                  {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.name}` : "اختر مادة أولًا"}
                </h2>
                <p className="mt-1 text-xs text-[#102C57]/55">
                  هذا الشات يجيب من الملفات المرفوعة للمادة المختارة فقط، مع ذكر المصادر المستخدمة في نهاية الإجابة.
                </p>
              </div>
              {selectedCourse ? (
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#F8F0E5] px-3 py-1 text-xs font-medium text-[#102C57]">
                  <Brain className="h-3.5 w-3.5" />
                  {documents.length > 0 ? `${documents.length} source(s) ready` : "No sources yet"}
                </div>
              ) : null}
            </div>

            {quickPrompts.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="rounded-full border border-[#DAC0A3]/30 bg-[#FCFAF7] px-3 py-1.5 text-xs text-[#102C57] transition hover:border-[#102C57]/30 hover:bg-[#F8F0E5]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {studyModes.map((mode) => {
                const active = studyMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setStudyMode(mode.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-[#102C57] text-[#F8F0E5]"
                        : "border border-[#DAC0A3]/30 bg-[#FCFAF7] text-[#102C57]"
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((message) => {
              const dir = detectTextDirection(message.content);
              const isAi = message.type === "ai";
              const linkedSources = isAi
                ? documents.filter((document) =>
                    extractSourceNames(message.content).includes(document.title ?? ""),
                  )
                : [];

              return (
                <div key={message.id} className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-3xl rounded-3xl px-4 py-3 ${
                      isAi
                        ? "border border-[#DAC0A3]/25 bg-[#FCFAF7] text-[#102C57]"
                        : "bg-[#102C57] text-[#F8F0E5]"
                    }`}
                  >
                    {isAi ? (
                      <div className="space-y-3">
                        <div className="prose prose-sm max-w-none text-inherit">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                        {linkedSources.length > 0 ? (
                          <div className="flex flex-wrap gap-2 border-t border-[#DAC0A3]/20 pt-3">
                            {linkedSources.map((source) =>
                              source.signed_url ? (
                                <a
                                  key={source.id}
                                  href={source.signed_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full bg-[#F8F0E5] px-3 py-1 text-xs font-medium text-[#102C57] hover:bg-[#efe3d2]"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>{source.title}</span>
                                </a>
                              ) : null,
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-7" dir={dir}>
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending ? (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-[#DAC0A3]/25 bg-[#FCFAF7] px-4 py-3 text-sm text-[#102C57]/70">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري تجهيز الإجابة من ملفات المادة...</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#DAC0A3]/20 px-5 py-4">
            {error ? (
              <p className="mb-3 rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                disabled={!selectedCourse || isSending}
                placeholder={
                  selectedCourse
                    ? `اسأل عن ${selectedCourse.code} أو اطلب تلخيصًا من الملفات المرفوعة...`
                    : "اختر مادة أولًا حتى تبدأ الشات"
                }
                className="flex-1 rounded-2xl border border-[#DAC0A3]/30 bg-[#FCFAF7] px-4 py-3 text-sm text-[#102C57] outline-none transition focus:border-[#102C57]/40"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!selectedCourse || !input.trim() || isSending}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102C57] px-5 py-3 text-sm font-semibold text-[#F8F0E5] transition hover:bg-[#0d2447] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Send</span>
              </button>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
