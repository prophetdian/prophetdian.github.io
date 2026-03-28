import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Courses() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<"personal" | "glory-grace" | undefined>();
  const { data: courses, isLoading } = trpc.courses.list.useQuery({
    limit: 20,
    offset: 0,
    category: selectedCategory,
  });

  const { data: enrollments } = trpc.courses.getEnrollments.useQuery(undefined, {
    enabled: !!user,
  });

  const enrollMutation = trpc.courses.enroll.useMutation({
    onSuccess: () => {
      toast.success("Successfully enrolled in course!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to enroll");
    },
  });

  const isEnrolled = (courseId: number) => {
    return enrollments?.some((e: any) => e.courseId === courseId);
  };

  const handleEnroll = (courseId: number) => {
    if (!user) {
      toast.error("Please sign in to enroll");
      return;
    }
    enrollMutation.mutate(courseId);
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-glow">Courses</h1>

        {/* Category Filter */}
        <div className="flex gap-4 mb-12 flex-wrap">
          <Button
            onClick={() => setSelectedCategory(undefined)}
            variant={selectedCategory === undefined ? "default" : "outline"}
            className={selectedCategory === undefined ? "bg-[#00F7FF] text-black" : "border-[#00F7FF] text-[#00F7FF]"}
          >
            All Courses
          </Button>
          <Button
            onClick={() => setSelectedCategory("personal")}
            variant={selectedCategory === "personal" ? "default" : "outline"}
            className={selectedCategory === "personal" ? "bg-[#00F7FF] text-black" : "border-[#00F7FF] text-[#00F7FF]"}
          >
            Prophet Dian's Courses
          </Button>
          <Button
            onClick={() => setSelectedCategory("glory-grace")}
            variant={selectedCategory === "glory-grace" ? "default" : "outline"}
            className={selectedCategory === "glory-grace" ? "bg-[#FA00FF] text-black" : "border-[#FA00FF] text-[#FA00FF]"}
          >
            Glory & Grace Courses
          </Button>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[#00F7FF]" />
            </div>
          ) : courses && courses.length > 0 ? (
            courses.map((course) => {
              const enrolled = isEnrolled(course.id);
              return (
                <Card key={course.id} className="prophet-card flex flex-col">
                  {course.image && (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-gray-400">
                        <BookOpen size={14} className="inline mr-1" />
                        {course.duration || "Self-paced"}
                      </span>
                      <span className="px-2 py-1 rounded bg-[#00F7FF]/20 text-[#00F7FF] text-xs">
                        {course.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Instructor: {course.instructor}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#FA00FF]">
                      ${parseFloat(course.price).toFixed(2)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-[#FA00FF]/20 text-[#FA00FF]">
                      {course.category === "personal" ? "Prophet Dian" : "Glory & Grace"}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrollMutation.isPending || enrolled}
                    className={`w-full mt-4 ${
                      enrolled
                        ? "bg-green-600 text-white"
                        : "bg-[#00F7FF] text-black hover:shadow-lg hover:shadow-[#00F7FF]/50"
                    }`}
                  >
                    {enrolled ? "Enrolled" : "Enroll Now"}
                  </Button>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No courses available in this category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
