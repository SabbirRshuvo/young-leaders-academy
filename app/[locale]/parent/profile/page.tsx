
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  country: string | null;
  preferred_language: string | null;
  phone: string | null;
};

type ParentProfile = {
  id: string;
  preferred_contact_method: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type EditForm = {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  preferred_language: string;
  preferred_contact_method: string;
};

export default function ParentProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [parentProfile, setParentProfile] =
    useState<ParentProfile | null>(null);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<EditForm>({
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    preferred_language: "",
    preferred_contact_method: "",
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

        /*
         * ---------------------------------------------------------------
         * Get currently authenticated Supabase user
         * ---------------------------------------------------------------
         */

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/en/login");
          return;
        }

        setEmail(user.email || "");

        /*
         * ---------------------------------------------------------------
         * Load common profile
         * ---------------------------------------------------------------
         *
         * profiles contains:
         *
         * id
         * first_name
         * last_name
         * display_name
         * phone
         * avatar_url
         * preferred_language
         * is_active
         * created_at
         * updated_at
         * country
         * date_of_birth
         *
         * We use maybeSingle() because we don't want
         * Supabase to throw PGRST116 if the row doesn't exist.
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
          phone
        `)
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Parent common profile lookup error:",
            profileError
          );

          toast.error("Unable to load your profile.");

          return;
        }

        /*
         * ---------------------------------------------------------------
         * Common profile does not exist
         * ---------------------------------------------------------------
         */

        if (!profileData) {
          console.error(
            "No profiles row found for user:",
            user.id
          );

          toast.error(
            "Your account profile could not be found."
          );

          return;
        }

        /*
         * ---------------------------------------------------------------
         * Load parent-specific profile
         * ---------------------------------------------------------------
         *
         * parent_profiles may not exist yet.
         *
         * This is NOT an error.
         *
         * maybeSingle() allows 0 or 1 row.
         */

        const {
          data: parentData,
          error: parentError,
        } = await supabase
          .from("parent_profiles")
          .select(`
          id,
          preferred_contact_method,
          created_at,
          updated_at
        `)
          .eq("id", user.id)
          .maybeSingle();

        if (parentError) {
          console.error(
            "Parent-specific profile lookup error:",
            parentError
          );

          toast.error(
            "Unable to load your parent information."
          );

          return;
        }

        /*
         * ---------------------------------------------------------------
         * Save state
         * ---------------------------------------------------------------
         */

        setProfile(profileData);
        setParentProfile(parentData);

        /*
         * ---------------------------------------------------------------
         * Prepare edit form
         * ---------------------------------------------------------------
         *
         * If parent_profiles doesn't exist yet,
         * preferred_contact_method simply starts empty.
         */

        setForm({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          phone: profileData.phone || "",
          country: profileData.country || "",
          preferred_language:
            profileData.preferred_language || "",
          preferred_contact_method:
            parentData?.preferred_contact_method || "",
        });
      } catch (error) {
        console.error(
          "Failed to load parent profile:",
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
  | Formatting helpers
  |--------------------------------------------------------------------------
  */

  const formatCountry = (country: string | null) => {
    if (!country) return "Not provided";

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
    if (!language) return "Not provided";

    const languages: Record<string, string> = {
      english: "English",
      arabic: "Arabic",
    };

    return languages[language] || language;
  };

  const formatContactMethod = (
    method: string | null
  ) => {
    if (!method) return "Not provided";

    const methods: Record<string, string> = {
      email: "Email",
      phone: "Phone",
      sms: "SMS",
      whatsapp: "WhatsApp",
    };

    return methods[method] || method;
  };

  /*
  |--------------------------------------------------------------------------
  | Form change
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
  | Save Profile
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      setSaving(true);

      /*
       * ---------------------------------------------------------------
       * Get authenticated user
       * ---------------------------------------------------------------
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Authenticated user error:", userError);

        toast.error("Your session has expired.");

        router.push("/en/login");

        return;
      }

      /*
       * ---------------------------------------------------------------
       * Update common profiles table
       * ---------------------------------------------------------------
       */

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name.trim() || null,
          last_name: form.last_name.trim() || null,
          phone: form.phone.trim() || null,
          country: form.country || null,
          preferred_language:
            form.preferred_language || null,
        })
        .eq("id", user.id);

      if (profileUpdateError) {
        console.error(
          "Profile update error:",
          profileUpdateError
        );

        toast.error(
          "Unable to update your basic profile information."
        );

        return;
      }

      /*
       * ---------------------------------------------------------------
       * Re-fetch updated common profile
       * ---------------------------------------------------------------
       *
       * We intentionally do NOT use:
       *
       * .select(...).single()
       *
       * directly after UPDATE.
       *
       * This avoids PGRST116 when Supabase/RLS returns
       * zero visible rows.
       */

      const {
        data: updatedProfile,
        error: profileFetchError,
      } = await supabase
        .from("profiles")
        .select(`
        id,
        first_name,
        last_name,
        country,
        preferred_language,
        phone
      `)
        .eq("id", user.id)
        .maybeSingle();

      if (profileFetchError) {
        console.error(
          "Updated profile fetch error:",
          profileFetchError
        );

        toast.error(
          "Your profile was updated, but we could not refresh the displayed information."
        );

        return;
      }

      if (!updatedProfile) {
        console.error(
          "Profile disappeared after update:",
          user.id
        );

        toast.error(
          "Your profile could not be refreshed after saving."
        );

        return;
      }

      /*
       * ---------------------------------------------------------------
       * Handle parent_profiles
       * ---------------------------------------------------------------
       */

      if (parentProfile) {
        /*
         * Existing parent profile → UPDATE
         */

        const { error: parentUpdateError } = await supabase
          .from("parent_profiles")
          .update({
            preferred_contact_method:
              form.preferred_contact_method || null,
          })
          .eq("id", user.id);

        if (parentUpdateError) {
          console.error(
            "Parent profile update error:",
            parentUpdateError
          );

          toast.error(
            "Basic information was saved, but your parent information could not be updated."
          );

          return;
        }
      } else {
        /*
         * No parent profile exists → CREATE
         */

        const { error: parentInsertError } = await supabase
          .from("parent_profiles")
          .insert({
            id: user.id,
            preferred_contact_method:
              form.preferred_contact_method || null,
          });

        if (parentInsertError) {
          console.error(
            "Parent profile creation error:",
            parentInsertError
          );

          toast.error(
            "Basic information was saved, but your parent information could not be created."
          );

          return;
        }
      }

      /*
       * ---------------------------------------------------------------
       * Re-fetch parent profile
       * ---------------------------------------------------------------
       */

      const {
        data: updatedParentProfile,
        error: parentFetchError,
      } = await supabase
        .from("parent_profiles")
        .select(`
        id,
        preferred_contact_method,
        created_at,
        updated_at
      `)
        .eq("id", user.id)
        .maybeSingle();

      if (parentFetchError) {
        console.error(
          "Updated parent profile fetch error:",
          parentFetchError
        );

        toast.error(
          "Your profile was saved, but we could not refresh your parent information."
        );

        return;
      }

      /*
       * ---------------------------------------------------------------
       * Update local React state
       * ---------------------------------------------------------------
       */

      setProfile(updatedProfile);

      setParentProfile(updatedParentProfile);

      setForm({
        first_name: updatedProfile.first_name || "",
        last_name: updatedProfile.last_name || "",
        phone: updatedProfile.phone || "",
        country: updatedProfile.country || "",
        preferred_language:
          updatedProfile.preferred_language || "",
        preferred_contact_method:
          updatedParentProfile?.preferred_contact_method || "",
      });

      /*
       * ---------------------------------------------------------------
       * Close modal
       * ---------------------------------------------------------------
       */

      setIsEditing(false);

      toast.success(
        "Your profile has been updated successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save parent profile:",
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
            Loading your profile...
          </span>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Profile not found
  |--------------------------------------------------------------------------
  */

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center">

          <h2 className="text-2xl font-bold text-navy">
            Profile not found
          </h2>

          <p className="mt-2 text-gray-500">
            We couldn't find your profile information.
          </p>

          <button
            onClick={() => router.push("/en")}
            className="mt-6 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy/90 transition-colors"
          >
            Back to Home
          </button>

        </div>
      </main>
    );
  }

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    "Parent";

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

          Back
        </button>

        {/* ============================================================
            Header
        ============================================================ */}

        <div className="rounded-3xl bg-navy p-8 sm:p-10 text-white shadow-lg">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">

            <div className="flex items-center gap-6">

              {/* Avatar */}

              <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-gold flex items-center justify-center shrink-0">

                <User className="w-11 h-11 text-gold" />

              </div>

              <div>

                <p className="text-sm font-semibold text-gold uppercase tracking-wider">
                  Parent Profile
                </p>

                <h1 className="mt-1 text-3xl sm:text-4xl font-bold">
                  {fullName}
                </h1>

                <p className="mt-2 text-white/70">
                  {email}
                </p>

              </div>

            </div>

            {/* Edit */}

            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold text-navy px-5 py-3 text-sm font-bold hover:brightness-95 transition-all shadow-sm"
            >
              <Pencil className="w-4 h-4" />

              Edit Profile
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
                  Personal Information
                </h2>

                <p className="text-sm text-gray-500">
                  Your basic account information
                </p>

              </div>

            </div>

            <div className="space-y-5">

              <ProfileItem
                label="First Name"
                value={profile.first_name}
              />

              <ProfileItem
                label="Last Name"
                value={profile.last_name}
              />

              <ProfileItem
                label="Email"
                value={email}
                icon={<Mail className="w-4 h-4" />}
              />

              <ProfileItem
                label="Phone Number"
                value={profile.phone}
                icon={<Phone className="w-4 h-4" />}
              />

            </div>

          </section>

          {/* ========================================================
              Preferences
          ======================================================== */}

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-gold" />
              </div>

              <div>

                <h2 className="font-bold text-navy text-lg">
                  Preferences
                </h2>

                <p className="text-sm text-gray-500">
                  Your location and language preferences
                </p>

              </div>

            </div>

            <div className="space-y-5">

              <ProfileItem
                label="Country"
                value={formatCountry(profile.country)}
                icon={<Globe2 className="w-4 h-4" />}
              />

              <ProfileItem
                label="Preferred Language"
                value={formatLanguage(
                  profile.preferred_language
                )}
                icon={<Languages className="w-4 h-4" />}
              />

            </div>

          </section>

          {/* ========================================================
              Communication
          ======================================================== */}

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-navy" />
              </div>

              <div>

                <h2 className="font-bold text-navy text-lg">
                  Communication
                </h2>

                <p className="text-sm text-gray-500">
                  How you prefer to be contacted
                </p>

              </div>

            </div>

            <ProfileItem
              label="Preferred Contact Method"
              value={formatContactMethod(
                parentProfile?.preferred_contact_method ||
                null
              )}
              icon={
                <MessageCircle className="w-4 h-4" />
              }
            />

          </section>

          {/* ========================================================
              Account Type
          ======================================================== */}

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <User className="w-5 h-5 text-gold" />
              </div>

              <div>

                <h2 className="font-bold text-navy text-lg">
                  Account Type
                </h2>

                <p className="text-sm text-gray-500">
                  Your Young Leaders Academy account
                </p>

              </div>

            </div>

            <span className="inline-flex items-center justify-center rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">
              Parent
            </span>

          </section>

        </div>

      </div>

      {/* ==============================================================
          EDIT PROFILE MODAL
      ============================================================== */}

      {isEditing && (

        <div className="fixed inset-0 z-[100] bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">

            {/* Modal header */}

            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 sm:px-8 py-5 flex items-center justify-between">

              <div>

                <p className="text-xs font-bold text-gold uppercase tracking-wider">
                  Parent Account
                </p>

                <h2 className="text-2xl font-bold text-navy mt-1">
                  Edit Profile
                </h2>

              </div>

              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Modal body */}

            <div className="p-6 sm:p-8">

              {/* =====================================================
                  Basic Information
              ===================================================== */}

              <div>

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center">
                    <User className="w-4 h-4 text-navy" />
                  </div>

                  <div>

                    <h3 className="font-bold text-navy">
                      Basic Information
                    </h3>

                    <p className="text-xs text-gray-500">
                      Update your personal details
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <FormField
                    label="First Name"
                    value={form.first_name}
                    onChange={(value) =>
                      handleChange(
                        "first_name",
                        value
                      )
                    }
                  />

                  <FormField
                    label="Last Name"
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
                    label="Phone Number"
                    value={form.phone}
                    onChange={(value) =>
                      handleChange(
                        "phone",
                        value
                      )
                    }
                  />

                </div>

              </div>

              {/* =====================================================
                  Preferences
              ===================================================== */}

              <div className="mt-8 pt-8 border-t border-gray-100">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Globe2 className="w-4 h-4 text-gold" />
                  </div>

                  <div>

                    <h3 className="font-bold text-navy">
                      Location & Language
                    </h3>

                    <p className="text-xs text-gray-500">
                      Manage your location and language preferences
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <SelectField
                    label="Country"
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
                    label="Preferred Language"
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

              {/* =====================================================
                  Communication
              ===================================================== */}

              <div className="mt-8 pt-8 border-t border-gray-100">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-navy" />
                  </div>

                  <div>

                    <h3 className="font-bold text-navy">
                      Communication Preferences
                    </h3>

                    <p className="text-xs text-gray-500">
                      Choose how you prefer to be contacted
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <SelectField
                    label="Preferred Contact Method"
                    value={form.preferred_contact_method}
                    onChange={(value) =>
                      handleChange(
                        "preferred_contact_method",
                        value
                      )
                    }
                    options={[
                      {
                        value: "email",
                        label: "Email",
                      },
                      {
                        value: "phone",
                        label: "Phone",
                      },
                      {
                        value: "sms",
                        label: "SMS",
                      },
                      {
                        value: "whatsapp",
                        label: "WhatsApp",
                      },
                    ]}
                  />

                </div>

              </div>

            </div>

            {/* =======================================================
                Modal footer
            ======================================================= */}

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 sm:px-8 py-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-200 text-navy font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-navy text-white font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60"
              >

                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
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
          {value || "Not provided"}
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
        className={`w-full h-11 rounded-xl border px-4 text-sm text-navy outline-none transition-colors ${disabled
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
