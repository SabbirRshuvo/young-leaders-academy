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
  ShieldCheck,
  Users,
  Award,
  BookOpen,
  GraduationCap,
  Calendar,
  ExternalLink,
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

type EditForm = {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  preferred_language: string;
};

export default function AdminProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const isAr = locale === "ar";
  const t = useTranslations("Profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<EditForm>({
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    preferred_language: "english",
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
        console.error("Admin profile lookup error:", profileError);
      }

      setProfile(profileData || null);

      setForm({
        first_name: profileData?.first_name || "",
        last_name: profileData?.last_name || "",
        phone: profileData?.phone || "",
        country: profileData?.country || "Saudi Arabia",
        preferred_language: profileData?.preferred_language || "english",
      });
    } catch (err) {
      console.error("Failed to load admin profile:", err);
      toast.error(
        isAr ? "تعذر تحميل بيانات الملف الشخصي" : "Unable to load profile data."
      );
    } finally {
      setLoading(false);
    }
  }, [router, getLocalizedHref, isAr]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (field: keyof EditForm, value: string) => {
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

      toast.success(
        isAr ? "تم تحديث الملف الشخصي بنجاح!" : "Profile updated successfully!"
      );
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(
        isAr ? "حدث خطأ أثناء الحفظ" : "An error occurred while saving."
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
          {isAr ? "جاري تحميل الملف الشخصي..." : "Loading admin profile..."}
        </p>
      </div>
    );
  }

  const fullName =
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "Administrator";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href={getLocalizedHref("/admin/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-bold text-navy hover:text-gold transition-colors w-fit"
          >
            <ArrowLeft className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
            {isAr ? "العودة إلى لوحة الإدارة" : "Back to Admin Dashboard"}
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
                fullName[0]?.toUpperCase() || "A"
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-bold border border-gold/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isAr ? "مسؤول النظام" : "System Administrator"}
                </span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-gray-600">
                {isAr
                  ? "إدارة برامج وأكاديمية القادة الشباب"
                  : "Young Leaders Academy Operations & Management"}
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

        {/* View or Edit */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-navy font-bold text-base border-b border-gray-100 pb-3">
                  <User className="w-5 h-5 text-gold" />
                  <h2>{isAr ? "المعلومات الشخصية" : "Personal Information"}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? "الاسم الأول" : "First Name"}
                    </p>
                    <p className="text-sm font-bold text-navy mt-1">
                      {profile?.first_name || (isAr ? "غير محدد" : "Not provided")}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? "اسم العائلة" : "Last Name"}
                    </p>
                    <p className="text-sm font-bold text-navy mt-1">
                      {profile?.last_name || (isAr ? "غير محدد" : "Not provided")}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? "البريد الإلكتروني" : "Email Address"}
                    </p>
                    <p className="text-sm font-bold text-navy mt-1 truncate">
                      {email}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? "رقم الهاتف" : "Phone"}
                    </p>
                    <p className="text-sm font-bold text-navy mt-1">
                      {profile?.phone || (isAr ? "غير محدد" : "Not provided")}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isAr ? "الدولة" : "Country"}
                    </p>
                    <p className="text-sm font-bold text-navy mt-1">
                      {profile?.country || "Saudi Arabia"}
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
            </div>

            {/* Quick Portals */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-navy flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold" />
                  {isAr ? "الإدارة السريعة" : "Admin Portals"}
                </h3>

                <div className="space-y-2">
                  <Link
                    href={getLocalizedHref("/admin/users")}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-bold text-navy"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gold" />
                      {isAr ? "إدارة المستخدمين" : "Manage Users"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </Link>

                  <Link
                    href={getLocalizedHref("/admin/coaches")}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-bold text-navy"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gold" />
                      {isAr ? "إدارة المدربين" : "Manage Coaches"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </Link>

                  <Link
                    href={getLocalizedHref("/admin/programs")}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-bold text-navy"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gold" />
                      {isAr ? "إدارة البرامج" : "Manage Programs"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </Link>

                  <Link
                    href={getLocalizedHref("/admin/universities")}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-xs font-bold text-navy"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gold" />
                      {isAr ? "إدارة الجامعات" : "Manage Universities"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-navy">
                {isAr ? "تعديل الملف الشخصي للمسؤول" : "Edit Admin Profile"}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "الاسم الأول" : "First Name"}
                </label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "اسم العائلة" : "Last Name"}
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "الدولة" : "Country"}
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  {isAr ? "اللغة المفضلة" : "Preferred Language"}
                </label>
                <select
                  value={form.preferred_language}
                  onChange={(e) => handleChange("preferred_language", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-navy text-navy font-medium bg-white"
                >
                  <option value="english">English</option>
                  <option value="arabic">العربية (Arabic)</option>
                </select>
              </div>
            </div>

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
