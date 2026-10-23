"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, BookOpen, GraduationCap, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AdminDashboardPage() {
  const t = useTranslations("Admin");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPrograms, setTotalPrograms] = useState<number>(0);
  const [totalUniversities, setTotalUniversities] = useState<number>(0);
  const [totalEnrollments, setTotalEnrollments] = useState<number>(0);
  const [totalApplications, setTotalApplications] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const getStatusLabel = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "active") return t("active");
    if (s === "draft") return t("draft");
    if (s === "paid") return t("paid");
    if (s === "unpaid") return t("unpaid");
    if (s === "pending") return t("pending");
    if (s === "accepted") return t("accepted");
    if (s === "rejected") return t("rejected");
    return status;
  };

  useEffect(() => {
    async function fetchData() {
      // Fetch exact users count matching /admin/users list
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          setTotalUsers(data.users?.length || 0);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
      const { count: programsCount } = await supabase
        .from("programs")
        .select('*', { count: 'exact', head: true });
        
      const { count: universitiesCount } = await supabase
        .from("universities")
        .select('*', { count: 'exact', head: true });
        
      const { count: enrollmentsCount } = await supabase
        .from("course_enrollments")
        .select('*', { count: 'exact', head: true });
        
      const { count: applicationsCount } = await supabase
        .from("university_applications")
        .select('*', { count: 'exact', head: true });

      if (programsCount !== null) setTotalPrograms(programsCount);
      if (universitiesCount !== null) setTotalUniversities(universitiesCount);
      if (enrollmentsCount !== null) setTotalEnrollments(enrollmentsCount);
      if (applicationsCount !== null) setTotalApplications(applicationsCount);

      // Fetch recent course enrollments
      const { data: recentEnrollments } = await supabase
        .from("course_enrollments")
        .select("id, user_id, course_id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentEnrollments && recentEnrollments.length > 0) {
        const userIds = Array.from(new Set(recentEnrollments.map((e: any) => e.user_id).filter(Boolean)));
        const courseIds = Array.from(new Set(recentEnrollments.map((e: any) => e.course_id).filter(Boolean)));

        const profileMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .in("id", userIds);
          if (profs) {
            profs.forEach((p: any) => { profileMap[p.id] = p; });
          }
        }

        const courseMap: Record<string, any> = {};
        if (courseIds.length > 0) {
          const { data: courses } = await supabase
            .from("courses")
            .select("id, title")
            .in("id", courseIds);
          if (courses) {
            courses.forEach((c: any) => { courseMap[c.id] = c; });
          }
        }

        const formattedEnrollments = recentEnrollments.map((e: any) => ({
          ...e,
          profiles: profileMap[e.user_id] || null,
          courses: courseMap[e.course_id] || null,
        }));
        setEnrollments(formattedEnrollments);
      } else {
        setEnrollments([]);
      }

      // Fetch recent university applications
      const { data: recentApplications } = await supabase
        .from("university_applications")
        .select(`
          id,
          first_name,
          last_name,
          email,
          program_id,
          status,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentApplications) setApplications(recentApplications);

      // Fetch student progress
      const { data: progress } = await supabase
        .from("course_progress")
        .select(`
          id,
          student_id,
          program_id,
          completed_lessons,
          is_completed,
          profiles:student_id(first_name, last_name)
        `)
        .limit(5);
      
      if (progress) {
        // Fetch course titles separately to avoid FK issues
        const courseIds = progress.map(p => p.program_id).filter(Boolean);
        let courseMap: Record<string, any> = {};
        
        if (courseIds.length > 0) {
          const { data: courses } = await supabase
            .from("courses")
            .select("id, title")
            .in("id", courseIds);
            
          if (courses) {
            courses.forEach(c => { courseMap[c.id] = c.title; });
          }
        }

        const formattedProgress = progress.map(p => ({
          ...p,
          course_title: courseMap[p.program_id] || "Unknown Course"
        }));
        
        setStudentProgress(formattedProgress);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">{t("dashboard")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("dashboardDesc")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t("totalUsers")}</p>
            <p className="text-2xl font-bold text-[#0B2545]">{loading ? '--' : totalUsers}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#0B2545]/5 flex items-center justify-center">
            <Users className="h-6 w-6 text-[#0B2545]" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t("totalPrograms")}</p>
            <p className="text-2xl font-bold text-[#0B2545]">{loading ? '--' : totalPrograms}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-[#D4AF37]" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t("totalUniversities")}</p>
            <p className="text-2xl font-bold text-[#0B2545]">{loading ? '--' : totalUniversities}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{t("uniApplications")}</p>
            <p className="text-2xl font-bold text-[#0B2545]">{loading ? '--' : totalApplications}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Course Enrollments */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0B2545]">{t("recentEnrollments")}</h2>
            <Link href={`/${locale}/admin/programs`} className="text-sm font-medium text-[#D4AF37] hover:text-[#b5952f] flex items-center">
              {t("viewAll")} <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm animate-pulse">{t("loadingData")}</div>
            ) : enrollments.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">{t("noRecentEnrollments")}</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {enrollments.map((enrollment) => {
                  const studentName = enrollment.profiles ? `${enrollment.profiles.first_name} ${enrollment.profiles.last_name}` : t("unknownStudent");
                  const courseTitle = enrollment.courses ? (typeof enrollment.courses.title === 'string' ? enrollment.courses.title : (locale === 'ar' ? (enrollment.courses.title.ar || enrollment.courses.title.en) : enrollment.courses.title.en)) : t("unknownCourse");
                  return (
                    <li key={enrollment.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-[#0B2545]">{studentName}</p>
                          <p className="text-xs text-gray-500 mt-1">{courseTitle}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getStatusLabel(enrollment.status)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* University Applications */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0B2545]">{t("recentUniApplications")}</h2>
            <Link href={`/${locale}/admin/programs?tab=Applications`} className="text-sm font-medium text-[#D4AF37] hover:text-[#b5952f] flex items-center">
              {t("viewAll")} <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm animate-pulse">{t("loadingData")}</div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">{t("noRecentApplications")}</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <li key={app.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-[#0B2545]">{app.first_name} {app.last_name}</p>
                        <p className="text-xs text-gray-500 mt-1">{app.program_id}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* Student Progress Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0B2545]">{t("studentProgress")}</h2>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm animate-pulse">{t("loadingData")}</div>
          ) : studentProgress.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">{t("noStudentProgress")}</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {studentProgress.map((prog) => {
                const studentName = prog.profiles ? `${prog.profiles.first_name} ${prog.profiles.last_name}` : t("unknownStudent");
                const courseTitle = typeof prog.course_title === 'string' ? prog.course_title : (locale === 'ar' ? (prog.course_title?.ar || prog.course_title?.en) : (prog.course_title?.en || t("unknownCourse")));
                const lessonsCount = prog.completed_lessons?.length || 0;
                
                return (
                  <li key={prog.id} className="p-5 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-[#0B2545]">{studentName}</p>
                      <p className="text-xs text-gray-500 mt-1">{courseTitle}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prog.is_completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {prog.is_completed ? t("completedRatio") : t("lessonsDone", { count: lessonsCount })}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
