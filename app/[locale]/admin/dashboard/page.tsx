"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, BookOpen, GraduationCap, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AdminDashboardPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const locale = (params.locale as string) || "en";

  useEffect(() => {
    async function fetchData() {
      // Fetch recent course enrollments
      const { data: recentEnrollments } = await supabase
        .from("course_enrollments")
        .select(`
          id,
          user_id,
          course_id,
          status,
          created_at,
          profiles:user_id(first_name, last_name, email),
          courses:course_id(title)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

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

      if (recentEnrollments) setEnrollments(recentEnrollments);
      if (recentApplications) setApplications(recentApplications);
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B2545]">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of platform activity and recent submissions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-[#0B2545]">--</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#0B2545]/5 flex items-center justify-center">
            <Users className="h-6 w-6 text-[#0B2545]" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Course Enrollments</p>
            <p className="text-2xl font-bold text-[#0B2545]">{enrollments.length > 0 ? 'Active' : '--'}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-[#D4AF37]" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Uni Applications</p>
            <p className="text-2xl font-bold text-[#0B2545]">{applications.length > 0 ? 'Active' : '--'}</p>
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
            <h2 className="text-lg font-bold text-[#0B2545]">Recent Enrollments</h2>
            <Link href={`/${locale}/admin/programs`} className="text-sm font-medium text-[#D4AF37] hover:text-[#b5952f] flex items-center">
              View all <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm animate-pulse">Loading data...</div>
            ) : enrollments.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No recent enrollments found.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {enrollments.map((enrollment) => {
                  const studentName = enrollment.profiles ? `${enrollment.profiles.first_name} ${enrollment.profiles.last_name}` : "Unknown Student";
                  const courseTitle = enrollment.courses ? (typeof enrollment.courses.title === 'string' ? enrollment.courses.title : enrollment.courses.title.en) : "Unknown Course";
                  return (
                    <li key={enrollment.id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-[#0B2545]">{studentName}</p>
                          <p className="text-xs text-gray-500 mt-1">{courseTitle}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {enrollment.status}
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
            <h2 className="text-lg font-bold text-[#0B2545]">Recent Uni Applications</h2>
            <Link href={`/${locale}/admin/applications`} className="text-sm font-medium text-[#D4AF37] hover:text-[#b5952f] flex items-center">
              View all <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm animate-pulse">Loading data...</div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No recent applications found.</div>
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
                        {app.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
