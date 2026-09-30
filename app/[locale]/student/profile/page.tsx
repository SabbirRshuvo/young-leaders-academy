"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  User,
  Mail,
  Calendar,
  Globe2,
  Languages,
  ArrowLeft,
  Loader2,
  Pencil,
  Phone,
  School,
  MapPin,
  GraduationCap,
  ShieldCheck,
  X,
  Save,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  preferred_language: string | null;
  date_of_birth: string | null;
  phone: string | null;
};

type StudentProfile = {
  id: string;
  date_of_birth: string | null;
  gender: string | null;
  school_name: string | null;
  grade_level: string | null;
  city: string | null;
  country: string | null;
  parent_constent_status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ParentRequest = {
  id: string;
  parent_id: string;
  student_id: string;
  status: string;
  created_at: string;
  parent: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    phone: string;
    country: string;
    email?: string;
  };
};

type EditForm = {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  preferred_language: string;
  date_of_birth: string;
  gender: string;
  school_name: string;
  grade_level: string;
  city: string;
};

export default function StudentProfilePage() {
  const router = useRouter();
  const t = useTranslations("Profile");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentProfile, setStudentProfile] =
    useState<StudentProfile | null>(null);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [parentRequests, setParentRequests] = useState<ParentRequest[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  const [form, setForm] = useState<EditForm>({
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    preferred_language: "",
    date_of_birth: "",
    gender: "",
    school_name: "",
    grade_level: "",
    city: "",
  });

  /*
  |--------------------------------------------------------------------------
  | Load Profile
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/en/sign-up");
          return;
        }

        setEmail(user.email || "");

        /*
         * ---------------------------------------------------------------
         * Common profile
         * ---------------------------------------------------------------
         */

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            country,
            preferred_language,
            date_of_birth,
            phone
          `)
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Profile lookup error:", profileError);
          toast.error(t("unableLoadProfile"));
          return;
        }

        /*
         * ---------------------------------------------------------------
         * Student profile
         * ---------------------------------------------------------------
         */

        const {
          data: studentData,
          error: studentError,
        } = await supabase
          .from("student_profiles")
          .select(`
            id,
            date_of_birth,
            gender,
            school_name,
            grade_level,
            city,
            country,
            parent_constent_status,
            created_at,
            updated_at
          `)
          .eq("id", user.id)
          .maybeSingle();

        if (studentError) {
          console.error(
            "Student profile lookup error:",
            studentError
          );

          toast.error(
            "Unable to load your student information."
          );

          return;
        }

        setProfile(profileData);
        setStudentProfile(studentData);

        /*
         * ---------------------------------------------------------------
         * Fetch Parent Requests
         * ---------------------------------------------------------------
         */
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const res = await fetch("/api/student/requests", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const reqData = await res.json();
                const requestsWithEmail = reqData.requests?.map((req: any) => {
                    const parentEmail = reqData.parentUsers?.find((u: any) => u.id === req.parent_id)?.email;
                    return { ...req, parent: { ...req.parent, email: parentEmail } };
                }) || [];
                setParentRequests(requestsWithEmail);
            }
        } catch (e) {
            console.error("Failed to fetch parent requests", e);
        }

        /*
         * ---------------------------------------------------------------
         * Prepare edit form
         * ---------------------------------------------------------------
         */

        setForm({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          phone: profileData.phone || "",

          country:
            studentData?.country ||
            profileData.country ||
            "",

          preferred_language:
            profileData.preferred_language || "",

          date_of_birth:
            studentData?.date_of_birth ||
            profileData.date_of_birth ||
            "",

          gender:
            studentData?.gender || "",

          school_name:
            studentData?.school_name || "",

          grade_level:
            studentData?.grade_level || "",

          city:
            studentData?.city || "",
        });
      } catch (error) {
        console.error(
          "Failed to load student profile:",
          error
        );

        toast.error(
          "Something went wrong while loading your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  /*
  |--------------------------------------------------------------------------
  | Formatting Helpers
  |--------------------------------------------------------------------------
  */

  const handleRequestAction = async (requestId: string, status: "accepted" | "rejected") => {
    try {
        setProcessingRequest(requestId);
        
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        const res = await fetch("/api/student/requests", {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ requestId, status })
        });
        
        if (res.ok) {
            setParentRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
            toast.success(`Request ${status} successfully.`);
        } else {
            const data = await res.json();
            toast.error(data.error || "Failed to update request.");
        }
    } catch (e) {
        console.error(e);
        toast.error("Error updating request.");
    } finally {
        setProcessingRequest(null);
    }
  };

  const formatCountry = (country: string | null) => {
    if (!country) return t("notProvided");

    const countries: Record<string, string> = {
      usa: "United States",
      canada: "Canada",
      uk: "United Kingdom",
      australia: "Australia",
      bangladesh: "Bangladesh",
    };

    return countries[country] || country;
  };

  const formatLanguage = (language: string | null) => {
    if (!language) return t("notProvided");

    const languages: Record<string, string> = {
      english: "English",
      arabic: "Arabic",
    };

    return languages[language] || language;
  };

  const formatDate = (date: string | null) => {
    if (!date) return t("notProvided");

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatGender = (gender: string | null) => {
    if (!gender) return t("notProvided");

    const genders: Record<string, string> = {
      male: "Male",
      female: "Female",
      other: "Other",
      prefer_not_to_say: "Prefer not to say",
    };

    return genders[gender] || gender;
  };

  const formatGradeLevel = (grade: string | null) => {
    if (!grade) return t("notProvided");

    const grades: Record<string, string> = {
      grade_6: "Grade 6",
      grade_7: "Grade 7",
      grade_8: "Grade 8",
      grade_9: "Grade 9",
      grade_10: "Grade 10",
      grade_11: "Grade 11",
      grade_12: "Grade 12",
      university: "University",
      other: "Other",
    };

    return grades[grade] || grade;
  };

  const formatConsentStatus = (status: string | null) => {
    if (!status) return "Not available";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (
    field: keyof EditForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Open Edit Modal
  |--------------------------------------------------------------------------
  */

  const handleEdit = () => {
    setForm({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",

      country:
        studentProfile?.country ||
        profile?.country ||
        "",

      preferred_language:
        profile?.preferred_language || "",

      date_of_birth:
        studentProfile?.date_of_birth ||
        profile?.date_of_birth ||
        "",

      gender:
        studentProfile?.gender || "",

      school_name:
        studentProfile?.school_name || "",

      grade_level:
        studentProfile?.grade_level || "",

      city:
        studentProfile?.city || "",
    });

    setIsEditing(true);
  };

  /*
  |--------------------------------------------------------------------------
  | Save Profile
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Your session has expired.");
        router.push("/en/sign-up");
        return;
      }

      /*
       * ---------------------------------------------------------------
       * Update common profiles table
       * ---------------------------------------------------------------
       */

      const { data: updatedProfile, error: profileError } =
        await supabase
          .from("profiles")
          .update({
            first_name:
              form.first_name.trim() || null,

            last_name:
              form.last_name.trim() || null,

            phone:
              form.phone.trim() || null,

            country:
              form.country || null,

            preferred_language:
              form.preferred_language || null,

            date_of_birth:
              form.date_of_birth || null,
          })
          .eq("id", user.id)
          .select(`
            id,
            first_name,
            last_name,
            country,
            preferred_language,
            date_of_birth,
            phone
          `)
          .single();

      if (profileError) {
        console.error(
          "Profile update error:",
          profileError
        );

        toast.error(
          "Unable to update your basic profile information."
        );

        return;
      }

      /*
       * ---------------------------------------------------------------
       * Student profile payload
       * ---------------------------------------------------------------
       */

      const studentPayload = {
        id: user.id,

        date_of_birth:
          form.date_of_birth || null,

        gender:
          form.gender || null,

        school_name:
          form.school_name.trim() || null,

        grade_level:
          form.grade_level || null,

        city:
          form.city.trim() || null,

        country:
          form.country || null,
      };

      /*
       * ---------------------------------------------------------------
       * Existing student profile
       * ---------------------------------------------------------------
       */

      if (studentProfile) {
        const {
          data: updatedStudentProfile,
          error: studentUpdateError,
        } = await supabase
          .from("student_profiles")
          .update(studentPayload)
          .eq("id", user.id)
          .select(`
            id,
            date_of_birth,
            gender,
            school_name,
            grade_level,
            city,
            country,
            parent_constent_status,
            created_at,
            updated_at
          `)
          .single();

        if (studentUpdateError) {
          console.error(
            "Student profile update error:",
            studentUpdateError
          );

          toast.error(
            "Basic information was saved, but student information could not be updated."
          );

          return;
        }

        setStudentProfile(updatedStudentProfile);
      }

      /*
       * ---------------------------------------------------------------
       * Student profile does not exist
       * ---------------------------------------------------------------
       */

      else {
        const {
          data: newStudentProfile,
          error: studentInsertError,
        } = await supabase
          .from("student_profiles")
          .insert({
            ...studentPayload,

            /*
             * The student cannot choose or modify consent status.
             * New student profiles begin as pending.
             */
            parent_constent_status: "pending",
          })
          .select(`
            id,
            date_of_birth,
            gender,
            school_name,
            grade_level,
            city,
            country,
            parent_constent_status,
            created_at,
            updated_at
          `)
          .single();

        if (studentInsertError) {
          console.error(
            "Student profile creation error:",
            studentInsertError
          );

          toast.error(
            "Basic information was saved, but student information could not be created."
          );

          return;
        }

        setStudentProfile(newStudentProfile);
      }

      /*
       * ---------------------------------------------------------------
       * Update local profile state
       * ---------------------------------------------------------------
       */

      setProfile(updatedProfile);
      setIsEditing(false);

      toast.success(
        "Your profile has been updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save student profile:",
        error
      );

      toast.error(
        "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex items-center gap-3 text-navy">
          <Loader2 className="w-5 h-5 animate-spin" />

          <span className="font-semibold">
      {t("loadingProfile")}
    </span>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Profile Not Found
  |--------------------------------------------------------------------------
  */

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy">
      {t("profileNotFound")}
    </h2>

          <p className="mt-2 text-gray-500">
      {t("profileNotFoundDesc")}
    </p>

          <button
            onClick={() => router.push("/en")}
            className="mt-6 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
          >
      {t("backToHome")}
    </button>
        </div>
      </main>
    );
  }

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    "Student";

  const consentStatus =
    studentProfile?.parent_constent_status || "pending";

  /*
  |--------------------------------------------------------------------------
  | Main UI
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ============================================================
            Back
        ============================================================ */}

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
      {t("back")}
    </button>

        {/* ============================================================
            Header
        ============================================================ */}

        <div className="rounded-3xl bg-navy p-8 sm:p-10 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

            <div className="flex items-center gap-6">

              <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-gold flex items-center justify-center shrink-0">
                <User className="w-11 h-11 text-gold" />
              </div>

              <div>
                <p className="text-sm font-semibold text-gold uppercase tracking-wider">
      {t("studentProfile")}
    </p>

                <h1 className="mt-1 text-3xl sm:text-4xl font-bold">
                  {fullName}
                </h1>

                <p className="mt-2 text-white/70">
                  {email}
                </p>
              </div>

            </div>

            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold text-navy px-5 py-3 text-sm font-bold hover:brightness-95 transition-all shadow-sm"
            >
              <Pencil className="w-4 h-4" />
      {t("editProfile")}
    </button>

          </div>
        </div>

        {/* ============================================================
            Profile Information
        ============================================================ */}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ========================================================
              Personal Information
          ======================================================== */}

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
                <User className="w-5 h-5 text-navy" />
              </div>

              <div>
                <h2 className="font-bold text-navy text-lg">
      {t("personalInfo")}
    </h2>

                <p className="text-sm text-gray-500">
      {t("personalInfoDesc")}
    </p>
              </div>
            </div>

            <div className="space-y-5">

              <ProfileItem
                label={t("firstName")}
                value={profile.first_name}
              />

              <ProfileItem
                label={t("lastName")}
                value={profile.last_name}
              />

              <ProfileItem
                label="Email"
                value={email}
                icon={<Mail className="w-4 h-4" />}
              />

              <ProfileItem
                label="Phone"
                value={profile.phone}
                icon={<Phone className="w-4 h-4" />}
              />

              <ProfileItem
                label={t("dateOfBirth")}
                value={formatDate(
                  studentProfile?.date_of_birth ||
                  profile.date_of_birth
                )}
                icon={<Calendar className="w-4 h-4" />}
              />

              <ProfileItem
                label={t("gender")}
                value={formatGender(
                  studentProfile?.gender || null
                )}
                icon={<User className="w-4 h-4" />}
              />

            </div>
          </section>

          {/* ========================================================
              Location & Language
          ======================================================== */}

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-gold" />
              </div>

              <div>
                <h2 className="font-bold text-navy text-lg">{t("locationLanguage")}</h2>

                <p className="text-sm text-gray-500">
      {t("locationLanguageDesc")}
    </p>
              </div>

            </div>

            <div className="space-y-5">

              <ProfileItem
                label={t("country")}
                value={formatCountry(
                  studentProfile?.country ||
                  profile.country
                )}
                icon={<Globe2 className="w-4 h-4" />}
              />

              <ProfileItem
                label={t("city")}
                value={studentProfile?.city || null}
                icon={<MapPin className="w-4 h-4" />}
              />

              <ProfileItem
                label={t("preferredLanguage")}
                value={formatLanguage(
                  profile.preferred_language
                )}
                icon={<Languages className="w-4 h-4" />}
              />

            </div>
          </section>

          {/* ========================================================
              Education
          ======================================================== */}

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-navy" />
              </div>

              <div>
                <h2 className="font-bold text-navy text-lg">
      {t("education")}
    </h2>

                <p className="text-sm text-gray-500">
      {t("educationDesc")}
    </p>
              </div>

            </div>

            <div className="space-y-5">

              <ProfileItem
                label="School"
                value={studentProfile?.school_name || null}
                icon={<School className="w-4 h-4" />}
              />

              <ProfileItem
                label={t("gradeLevel")}
                value={formatGradeLevel(
                  studentProfile?.grade_level || null
                )}
                icon={
                  <GraduationCap className="w-4 h-4" />
                }
              />

            </div>
          </section>

          {/* ========================================================
              Parent Consent
          ======================================================== */}

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gold" />
              </div>

              <div>
                <h2 className="font-bold text-navy text-lg">
      {t("parentConsent")}
    </h2>

                <p className="text-sm text-gray-500">
      {t("parentConsentDesc")}
    </p>
              </div>

            </div>

            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
      {t("currentStatus")}
    </p>

                <p className="mt-1 text-sm font-semibold text-navy">
                  {formatConsentStatus(consentStatus)}
                </p>
              </div>

              <span className="inline-flex items-center justify-center rounded-full bg-navy px-4 py-2 text-xs font-bold text-white">
                {formatConsentStatus(consentStatus)}
              </span>

            </div>

          </section>

        </div>

        {/* ============================================================
            Parent Connections / Requests
        ============================================================ */}

        {parentRequests.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
                <User className="w-5 h-5 text-navy" />
              </div>
              <div>
                <h2 className="font-bold text-navy text-lg">Parent Connections</h2>
                <p className="text-sm text-gray-500">
                  Manage your parent connection requests
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parentRequests.map((req) => (
                <div key={req.id} className="flex flex-col gap-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center overflow-hidden">
                      {req.parent?.avatar_url ? (
                        <img src={req.parent.avatar_url} alt="Parent" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-navy" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-sm">
                        {req.parent?.first_name} {req.parent?.last_name}
                      </h3>
                      <p className="text-xs text-gray-500">{req.parent?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                    <span className={`text-xs font-bold uppercase ${
                      req.status === 'accepted' ? 'text-green-600' :
                      req.status === 'rejected' ? 'text-red-600' :
                      'text-orange-500'
                    }`}>
                      {req.status}
                    </span>

                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestAction(req.id, "rejected")}
                          disabled={processingRequest === req.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleRequestAction(req.id, "accepted")}
                          disabled={processingRequest === req.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            Account Type
        ============================================================ */}

        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>
              <h2 className="font-bold text-navy">
      {t("accountType")}
    </h2>

              <p className="text-sm text-gray-500 mt-1">
      {t("accountTypeDesc")}
    </p>
            </div>

            <span className="inline-flex items-center justify-center rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">
      {t("student")}
    </span>

          </div>

        </div>

      </div>

      {/* ==============================================================
          EDIT PROFILE MODAL
      ============================================================== */}

      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">

            {/* ======================================================
                Modal Header
            ====================================================== */}

            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 sm:px-8 py-5 flex items-center justify-between">

              <div>
                <p className="text-xs font-bold text-gold uppercase tracking-wider">
      {t("studentAccount")}
    </p>

                <h2 className="text-2xl font-bold text-navy mt-1">
      {t("editProfile")}
    </h2>
              </div>

              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* ======================================================
                Modal Body
            ====================================================== */}

            <div className="p-6 sm:p-8">

              {/* ==================================================
                  Basic Information
              ================================================== */}

              <div>

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center">
                    <User className="w-4 h-4 text-navy" />
                  </div>

                  <div>
                    <h3 className="font-bold text-navy">
      {t("basicInfo")}
    </h3>

                    <p className="text-xs text-gray-500">
      {t("basicInfoDesc")}
    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <FormField
                    label={t("firstName")}
                    value={form.first_name}
                    onChange={(value) =>
                      handleChange(
                        "first_name",
                        value
                      )
                    }
                  />

                  <FormField
                    label={t("lastName")}
                    value={form.last_name}
                    onChange={(value) =>
                      handleChange(
                        "last_name",
                        value
                      )
                    }
                  />

                  <FormField
                    label="Email"
                    value={email}
                    disabled
                    helper="Email is managed by your account."
                  />

                  <FormField
                    label="Phone"
                    value={form.phone}
                    onChange={(value) =>
                      handleChange(
                        "phone",
                        value
                      )
                    }
                  />

                  <FormField
                    label={t("dateOfBirth")}
                    type="date"
                    value={form.date_of_birth}
                    onChange={(value) =>
                      handleChange(
                        "date_of_birth",
                        value
                      )
                    }
                  />

                  <SelectField
                    label={t("gender")}
                    value={form.gender}
                    onChange={(value) =>
                      handleChange(
                        "gender",
                        value
                      )
                    }
                    options={[
                      {
                        value: "male",
                        label: "Male",
                      },
                      {
                        value: "female",
                        label: "Female",
                      },
                      {
                        value: "other",
                        label: "Other",
                      },
                      {
                        value: "prefer_not_to_say",
                        label: "Prefer not to say",
                      },
                    ]}
                  />

                </div>
              </div>

              {/* ==================================================
                  Location & Language
              ================================================== */}

              <div className="mt-8 pt-8 border-t border-gray-100">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Globe2 className="w-4 h-4 text-gold" />
                  </div>

                  <div>
                    <h3 className="font-bold text-navy">{t("locationLanguage")}</h3>

                    <p className="text-xs text-gray-500">{t("locationLanguageDescParent")}</p>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <FormField
                    label={t("city")}
                    value={form.city}
                    onChange={(value) =>
                      handleChange(
                        "city",
                        value
                      )
                    }
                  />

                  <SelectField
                    label={t("country")}
                    value={form.country}
                    onChange={(value) =>
                      handleChange(
                        "country",
                        value
                      )
                    }
                    options={[
                      {
                        value: "usa",
                        label: "United States",
                      },
                      {
                        value: "canada",
                        label: "Canada",
                      },
                      {
                        value: "uk",
                        label: "United Kingdom",
                      },
                      {
                        value: "australia",
                        label: "Australia",
                      },
                      {
                        value: "bangladesh",
                        label: "Bangladesh",
                      },
                    ]}
                  />

                  <SelectField
                    label={t("preferredLanguage")}
                    value={form.preferred_language}
                    onChange={(value) =>
                      handleChange(
                        "preferred_language",
                        value
                      )
                    }
                    options={[
                      {
                        value: "english",
                        label: "English",
                      },
                      {
                        value: "arabic",
                        label: "Arabic",
                      },
                    ]}
                  />

                </div>
              </div>

              {/* ==================================================
                  Education
              ================================================== */}

              <div className="mt-8 pt-8 border-t border-gray-100">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-navy" />
                  </div>

                  <div>
                    <h3 className="font-bold text-navy">
      {t("education")}
    </h3>

                    <p className="text-xs text-gray-500">{t("educationSection")}</p>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <FormField
                    label={t("schoolName")}
                    value={form.school_name}
                    onChange={(value) =>
                      handleChange(
                        "school_name",
                        value
                      )
                    }
                  />

                  <SelectField
                    label={t("gradeLevel")}
                    value={form.grade_level}
                    onChange={(value) =>
                      handleChange(
                        "grade_level",
                        value
                      )
                    }
                    options={[
                      {
                        value: "grade_6",
                        label: "Grade 6",
                      },
                      {
                        value: "grade_7",
                        label: "Grade 7",
                      },
                      {
                        value: "grade_8",
                        label: "Grade 8",
                      },
                      {
                        value: "grade_9",
                        label: "Grade 9",
                      },
                      {
                        value: "grade_10",
                        label: "Grade 10",
                      },
                      {
                        value: "grade_11",
                        label: "Grade 11",
                      },
                      {
                        value: "grade_12",
                        label: "Grade 12",
                      },
                      {
                        value: "university",
                        label: "University",
                      },
                      {
                        value: "other",
                        label: "Other",
                      },
                    ]}
                  />

                </div>
              </div>

              {/* ==================================================
                  Parent Consent
              ================================================== */}

              <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-200 p-4">

                <div className="flex items-start gap-3">

                  <ShieldCheck className="w-5 h-5 text-gold mt-0.5 shrink-0" />

                  <div>

                    <p className="text-sm font-bold text-navy">
      {t("parentConsent")}
    </p>

                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {t("parentConsentNotice")}
                    </p>

                    <p className="text-sm font-semibold text-navy mt-2">
                      Current status:{" "}
                      <span className="text-gold">
                        {formatConsentStatus(consentStatus)}
                      </span>
                    </p>

                  </div>

                </div>
              </div>

            </div>

            {/* ======================================================
                Modal Footer
            ====================================================== */}

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 sm:px-8 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-200 text-navy font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >{t("cancel")}</button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-navy text-white font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60"
              >

                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />{t("saving")}</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />{t("saveChanges")}</>
                )}

              </button>

            </div>

          </div>
        </div>
      )}
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| Profile Item
|--------------------------------------------------------------------------
*/

function ProfileItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
}) {
  const t = useTranslations("Profile");
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-navy">

        {icon && (
          <span className="text-gray-400">
            {icon}
          </span>
        )}

        <span>
          {value || t("notProvided")}
        </span>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Form Field
|--------------------------------------------------------------------------
*/

function FormField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  helper,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  disabled?: boolean;
  helper?: string;
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-navy mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange?.(e.target.value)
        }
        className={`w-full h-11 rounded-xl border px-4 text-sm text-navy outline-none transition-colors ${
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-200 focus:border-navy focus:ring-2 focus:ring-navy/10"
        }`}
      />

      {helper && (
        <p className="text-xs text-gray-400 mt-1.5">
          {helper}
        </p>
      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Select Field
|--------------------------------------------------------------------------
*/

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-navy mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-navy outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/10"
      >

        <option value="">
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}
