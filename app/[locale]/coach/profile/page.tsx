"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  User,
  Mail,
  Phone,
  Globe2,
  Languages,
  ArrowLeft,
  Loader2,
  Pencil,
  X,
  Save,
  Video,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Briefcase,
  Clock,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  preferred_language: string | null;
  phone: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
};

type CoachProfile = {
  id: string;
  professional_title: string | null;
  specialization: string | null;
  bio: string | null;
  years_of_experience: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type EditForm = {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  preferred_language: string;
  professional_title: string;
  specialization: string;
  years_of_experience: number;
  bio: string;
};

export default function CoachProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const isAr = locale === "ar";
  const t = useTranslations("Profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [assignedModules, setAssignedModules] = useState<any[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);

  const [form, setForm] = useState<EditForm>({
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    preferred_language: "english",
    professional_title: "",
    specialization: "",
    years_of_experience: 3,
    bio: "",
  });

  const getLocalizedHref = useCallback(
    (href: string) => {
      if (locale === "en") return href;
      return `/${locale}${href === "/" ? "" : href}`;
    },
    [locale]
  );

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push(getLocalizedHref("/login"));
        return;
      }

      setEmail(user.email || "");

      // 1. Fetch common profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          country,
          preferred_language,
          phone,
          avatar_url,
          created_at
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Coach common profile lookup error:", profileError);
      }

      // 2. Fetch coach specific profile (if exists)
      const { data: cpData, error: cpError } = await supabase
        .from("coach_profiles")
        .select(`
          id,
          professional_title,
          specialization,
          bio,
          years_of_experience,
          created_at,
          updated_at
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (cpError) {
        console.warn("Coach profile query notice:", cpError.message);
      }

      setProfile(profileData || null);
      setCoachProfile(cpData || null);

      // Populate form state
      setForm({
        first_name: profileData?.first_name || "",
        last_name: profileData?.last_name || "",
        phone: profileData?.phone || "",
        country: profileData?.country || "Saudi Arabia",
        preferred_language: profileData?.preferred_language || "english",
        professional_title:
          cpData?.professional_title || "YLA Certified Coach & Mentor",
        specialization:
          cpData?.specialization || "Leadership & Career Guidance",
        years_of_experience: cpData?.years_of_experience ?? 3,
        bio:
          cpData?.bio ||
          "Certified mentor empowering students and future leaders.",
      });

      // 3. Fetch assigned modules count & names
      try {
        const resAdmin = await fetch("/api/admin/coaches");
        if (resAdmin.ok) {
          const data = await resAdmin.json();
          const coachAssignments = (data.assignments || []).filter(
            (a: any) => a.coach_id === user.id
          );
          const modIds = coachAssignments.map((a: any) => a.module_id);
          const myMods = (data.modules || []).filter((m: any) =>
            modIds.includes(m.id)
          );
          setAssignedModules(myMods);
        }
      } catch (err) {
        console.warn("Could not fetch assigned modules:", err);
      }

      // 4. Fetch total sessions count
      try {
        const resBookings = await fetch(
          `/api/coach/bookings?coachId=${user.id}`
        );
        if (resBookings.ok) {
          const data = await resBookings.json();
          setTotalSessions((data.bookings || []).length);
        }
      } catch (err) {
        console.warn("Could not fetch bookings count:", err);
      }
    } catch (err) {
      console.error("Failed to load coach profile:", err);
      toast.error(
        isAr
          ? "تعذر تحميل بيانات الملف الشخصي"
          : "Unable to load profile data."
      );
    } finally {
      setLoading(false);
    }
  }, [router, getLocalizedHref, isAr]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (field: keyof EditForm, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error(
          isAr ? "انتهت الجلسة. الرجاء تسجيل الدخول مجدداً." : "Session expired. Please log in again."
        );
        router.push(getLocalizedHref("/login"));
        return;
      }

      // 1. Update common profiles table
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name.trim() || null,
          last_name: form.last_name.trim() || null,
          phone: form.phone.trim() || null,
          country: form.country.trim() || null,
          preferred_language: form.preferred_language || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileUpdateError) {
        console.error("Failed updating profile:", profileUpdateError);
        toast.error(
          isAr ? "فشل تحديث البيانات الشخصية" : "Failed to update personal details."
        );
        return;
      }

      // 2. Upsert coach_profiles table
      const { error: coachUpdateError } = await supabase
        .from("coach_profiles")
        .upsert({
          id: user.id,
          professional_title: form.professional_title.trim() || "YLA Certified Coach",
          specialization: form.specialization.trim() || "Leadership",
          years_of_experience: Number(form.years_of_experience) || 3,
          bio: form.bio.trim() || null,
          updated_at: new Date().toISOString(),
        });

      if (coachUpdateError) {
        console.error("Failed updating coach profile:", coachUpdateError);
        toast.error(
          isAr ? "فشل تحديث ملف التدريب" : "Failed to update coach information."
        );
        return;
      }

      toast.success(
        isAr ? "تم تحديث الملف الشخصي بنجاح!" : "Profile updated successfully!"
      );
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(
        isAr ? "حدث خطأ غير متوقع أثناء الحفظ" : "An unexpected error occurred while saving."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-gray-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
        <p className="text-sm font-semibold text-navy">
          {isAr ? "جاري تحميل الملف الشخصي..." : "Loading coach profile..."}
        </p>
      </div>
    );
  }

  const fullName =
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "Coach";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href={getLocalizedHref("/coach/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-gold transition-colors w-fit"
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
            {isAr ? "العودة إلى لوحة التحكم" : "Back to Dashboard"}
          </Link>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-navy text-white hover:bg-navy/90 text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Pencil className="w-4 h-4 text-gold" />
              {isAr ? "تعديل الملف الشخصي" : "Edit Profile"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  loadProfile();
                }}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gold text-navy hover:bg-gold/90 text-sm font-bold shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isAr ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-navy to-[#1E3A8A] text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-md shrink-0 border-2 border-gold/30">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={fullName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                fullName[0]?.toUpperCase() || "C"
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-bold border border-gold/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isAr ? "مدرب معتمد" : "YLA Certified Coach"}
                </span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-gray-600">
                {coachProfile?.professional_title || "YLA Certified Coach & Mentor"}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {email}
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {profile.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-gray-400" />
                  {profile?.country || "Saudi Arabia"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isAr ? "الوحدات المعتمدة" : "Assigned Modules"}
              </span>
              <BookOpen className="w-4 h-4 text-gold" />
            </div>
            <p className="text-2xl font-black text-navy">{assignedModules.length}</p>
            <p className="text-xs text-gray-500">
              {isAr ? "مناهج تدريبية معتمدة" : "Active curricula"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isAr ? "سنوات الخبرة" : "Experience"}
              </span>
              <Award className="w-4 h-4 text-gold" />
            </div>
            <p className="text-2xl font-black text-navy">
              {coachProfile?.years_of_experience || 3}+
            </p>
            <p className="text-xs text-gray-500">
              {isAr ? "سنوات من التدريب" : "Years in coaching"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isAr ? "جلسات 1-على-1" : "Sessions"}
              </span>
              <Calendar className="w-4 h-4 text-gold" />
            </div>
            <p className="text-2xl font-black text-navy">{totalSessions}</p>
            <p className="text-xs text-gray-500">
              {isAr ? "إجمالي الجلسات المحجوزة" : "Bookings recorded"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isAr ? "حالة الحساب" : "Account Status"}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-emerald-600 mt-1">
              {isAr ? "نشط ومعتمد" : "Verified & Active"}
            </p>
            <p className="text-xs text-gray-500">
              {isAr ? "حساب مدرب معتمد" : "Official YLA Mentor"}
            </p>
          </div>
        </div>

        {/* Content Body: View or Edit Mode */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left 2 Cols: Details & Bio */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio / Statement */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-navy font-bold text-base border-b border-gray-100 pb-3">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <h2>{isAr ? "نبذة عن المدرب" : "About & Coaching Philosophy"}</h2>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {coachProfile?.bio ||
                    (isAr
                      ? "مدرب معتمد في أكاديمية القادة الشباب، متخصص في تنمية المهارات القيادية والتوجيه الأكاديمي والمهني للطلاب."
                      : "Certified mentor dedicated to unlocking youth potential, fostering leadership traits, and guiding university-bound students.")}
                </p>
              </div>

              {/* Professional Credentials */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-navy font-bold text-base border-b border-gray-100 pb-3">
                  <Briefcase className="w-5 h-5 text-gold" />
                  <h2>{isAr ? "المعلومات المهنية والتخصص" : "Professional & Specialization"}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? "المسمى المهني" : "Professional Title"}
                    </p>
                    <p className="text-sm font-bold text-navy mt-1">
                      {coachProfile?.professional_title || "YLA Certified Coach"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? "مجال التخصص" : "Specialization"}
                    </p>
                    <p className="text-sm font-bold text-navy mt-1">
                      {coachProfile?.specialization || "Leadership & Career Guidance"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? "سنوات الخبرة" : "Years of Experience"}
                    </p>
                    <p className="text-sm font-bold text-navy mt-1">
                      {coachProfile?.years_of_experience || 3}{" "}
                      {isAr ? "سنوات" : "Years"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? "اللغة المفضلة" : "Preferred Language"}
                    </p>
                    <p className="text-sm font-bold text-navy mt-1 capitalize">
                      {profile?.preferred_language || "English"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Modules List */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-navy font-bold text-base">
                    <BookOpen className="w-5 h-5 text-gold" />
                    <h2>{isAr ? "المناهج والوحدات المخصصة" : "Certified Teaching Modules"}</h2>
                  </div>
                  <Link
                    href={getLocalizedHref("/coach/modules")}
                    className="text-xs font-bold text-gold hover:underline flex items-center gap-1"
                  >
                    {isAr ? "عرض التفاصيل" : "View Modules"}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {assignedModules.length === 0 ? (
                  <p className="text-sm text-gray-500 py-3">
                    {isAr
                      ? "لم يتم تعيين وحدات تدريبية لهذا الحساب بعد."
                      : "No curriculum modules assigned yet. Modules can be assigned by the administrator."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedModules.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center font-bold text-xs shrink-0">
                          {mod.order_index ?? "M"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-navy truncate">
                            {mod.title}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {mod.programs?.title || "Leadership Program"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Video Setup & Quick Links */}
            <div className="space-y-6">
              {/* Meeting Setup Notice */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-navy font-bold text-base border-b border-gray-100 pb-3">
                  <Video className="w-5 h-5 text-gold" />
                  <h2>{isAr ? "جلسات الفيديو 1-على-1" : "1-on-1 Video Sessions"}</h2>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {isAr
                      ? "يتم تحديد روابط اجتماعات الفيديو (Zoom أو Google Meet) مباشرة عند إنشاء ونشر مواعيد الجلسات في جدول التوجيه."
                      : "Video meeting links (Zoom, Google Meet) are configured directly when publishing available calendar slots in your 1-on-1 Calendar."}
                  </p>

                  <Link
                    href={getLocalizedHref("/coach/sessions")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-gold transition-colors"
                  >
                    <span>{isAr ? "إدارة مواعيد الجلسات" : "Manage Calendar Slots"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-gradient-to-br from-navy to-[#112240] rounded-2xl p-6 text-white shadow-md space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold" />
                  {isAr ? "إدارة التوجيه" : "Coaching Portal"}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isAr
                    ? "انتقل إلى جدول الجلسات لنشر المواعيد الشاغرة ومتابعة حجوزات الطلاب."
                    : "Access your 1-on-1 calendar to publish available slots and review student bookings."}
                </p>

                <div className="space-y-2 pt-2">
                  <Link
                    href={getLocalizedHref("/coach/sessions")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gold text-navy font-bold text-xs hover:bg-gold/90 transition-all shadow-sm"
                  >
                    <Clock className="w-4 h-4" />
                    {isAr ? "فتح جدول الجلسات" : "Open 1-on-1 Calendar"}
                  </Link>

                  <Link
                    href={getLocalizedHref("/coach/modules")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all border border-white/10"
                  >
                    <BookOpen className="w-4 h-4" />
                    {isAr ? "الوحدات والمناهج" : "View Assigned Modules"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Profile Form */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-navy">
                {isAr ? "تعديل الملف الشخصي للمدرب" : "Edit Coach Profile"}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isAr
                  ? "قم بتحديث معلوماتك الشخصية، ومسماك المهني، ورابط اجتماعات Zoom."
                  : "Update your personal details, credentials, and video meeting preferences."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "الاسم الأول *" : "First Name *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                    placeholder="First Name"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "اسم العائلة *" : "Last Name *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                    placeholder="Last Name"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                    placeholder="+966 5x xxx xxxx"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "الدولة / الموقع" : "Country / Location"}
                </label>
                <div className="relative">
                  <Globe2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                    placeholder="Saudi Arabia"
                  />
                </div>
              </div>

              {/* Professional Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "المسمى المهني *" : "Professional Title *"}
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.professional_title}
                    onChange={(e) => handleChange("professional_title", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                    placeholder="e.g. Senior Leadership Coach & Mentor"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "مجال التخصص *" : "Specialization *"}
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.specialization}
                    onChange={(e) => handleChange("specialization", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                    placeholder="e.g. Youth Leadership, Public Speaking, Academic Mentorship"
                  />
                </div>
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "سنوات الخبرة" : "Years of Experience"}
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.years_of_experience}
                  onChange={(e) => handleChange("years_of_experience", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                />
              </div>

              {/* Preferred Language */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "لغة التدريب المفضلة" : "Preferred Language"}
                </label>
                <div className="relative">
                  <Languages className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={form.preferred_language}
                    onChange={(e) => handleChange("preferred_language", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium bg-white"
                  >
                    <option value="english">English</option>
                    <option value="arabic">العربية (Arabic)</option>
                    <option value="bilingual">Bilingual (English & Arabic)</option>
                  </select>
                </div>
              </div>



              {/* Bio */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "نبذة عن المدرب والخبرات" : "Coach Bio / About Me"}
                </label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium leading-relaxed"
                  placeholder="Share a brief overview of your mentorship approach, background, and expertise..."
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  loadProfile();
                }}
                disabled={saving}
                className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gold text-navy hover:bg-gold/90 text-sm font-bold shadow-md transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isAr ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
