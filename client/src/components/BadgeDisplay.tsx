import { Sword, Eye, BookOpen, GraduationCap, Megaphone } from "lucide-react";

interface BadgeDisplayProps {
  hasApostleBadge?: boolean;
  hasProphetBadge?: boolean;
  hasPastorBadge?: boolean;
  hasTeacherBadge?: boolean;
  hasEvangelistBadge?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function BadgeDisplay({
  hasApostleBadge,
  hasProphetBadge,
  hasPastorBadge,
  hasTeacherBadge,
  hasEvangelistBadge,
  size = "md",
}: BadgeDisplayProps) {
  const sizeMap = {
    sm: { icon: 14, container: "gap-1" },
    md: { icon: 18, container: "gap-2" },
    lg: { icon: 24, container: "gap-3" },
  };

  const badges = [
    {
      has: hasApostleBadge,
      Icon: Sword,
      color: "#00F7FF",
      label: "Apostle",
      title: "Apostle Badge",
    },
    {
      has: hasProphetBadge,
      Icon: Eye,
      color: "#FA00FF",
      label: "Prophet",
      title: "Prophet Badge",
    },
    {
      has: hasPastorBadge,
      Icon: BookOpen,
      color: "#00F7FF",
      label: "Pastor",
      title: "Pastor Badge",
    },
    {
      has: hasTeacherBadge,
      Icon: GraduationCap,
      color: "#FA00FF",
      label: "Teacher",
      title: "Teacher Badge",
    },
    {
      has: hasEvangelistBadge,
      Icon: Megaphone,
      color: "#00F7FF",
      label: "Evangelist",
      title: "Evangelist Badge",
    },
  ];

  const activeBadges = badges.filter((b) => b.has);

  if (activeBadges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap ${sizeMap[size].container}`}>
      {activeBadges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 border border-[#00F7FF]/30 hover:border-[#FA00FF]/50 transition-all"
          title={badge.title}
        >
          <badge.Icon
            size={sizeMap[size].icon}
            style={{ color: badge.color }}
            className="flex-shrink-0"
          />
          {size !== "sm" && (
            <span
              className="text-xs font-semibold"
              style={{ color: badge.color }}
            >
              {badge.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
