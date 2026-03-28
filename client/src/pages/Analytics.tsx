import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Eye, Heart, MessageCircle, TrendingUp } from "lucide-react";

const COLORS = ["#00F7FF", "#FA00FF", "#FF6B9D", "#C44569"];

const postData = [
  { name: "Mon", views: 240, likes: 24, comments: 12 },
  { name: "Tue", views: 321, likes: 32, comments: 18 },
  { name: "Wed", views: 289, likes: 28, comments: 15 },
  { name: "Thu", views: 412, likes: 41, comments: 25 },
  { name: "Fri", views: 389, likes: 38, comments: 22 },
  { name: "Sat", views: 456, likes: 45, comments: 30 },
  { name: "Sun", views: 523, likes: 52, comments: 35 },
];

const categoryData = [
  { name: "Prophecy", value: 45 },
  { name: "Testimony", value: 25 },
  { name: "Prayer", value: 18 },
  { name: "Teaching", value: 12 },
];

const topPosts = [
  { title: "Divine Wisdom for Today", views: 1523, likes: 152, comments: 87 },
  { title: "Prophetic Insights", views: 1289, likes: 128, comments: 64 },
  { title: "Spiritual Growth Journey", views: 987, likes: 98, comments: 52 },
  { title: "Prayer and Meditation", views: 756, likes: 75, comments: 41 },
];

export default function Analytics() {
  const totalViews = postData.reduce((sum, d) => sum + d.views, 0);
  const totalLikes = postData.reduce((sum, d) => sum + d.likes, 0);
  const totalComments = postData.reduce((sum, d) => sum + d.comments, 0);
  const totalPosts = 156;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-glow">Analytics Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="prophet-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Views</p>
                <p className="text-3xl font-bold text-[#00F7FF]">{totalViews.toLocaleString()}</p>
              </div>
              <Eye size={32} className="text-[#00F7FF] opacity-50" />
            </div>
          </Card>

          <Card className="prophet-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Likes</p>
                <p className="text-3xl font-bold text-[#FA00FF]">{totalLikes.toLocaleString()}</p>
              </div>
              <Heart size={32} className="text-[#FA00FF] opacity-50" fill="#FA00FF" />
            </div>
          </Card>

          <Card className="prophet-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Comments</p>
                <p className="text-3xl font-bold text-[#00F7FF]">{totalComments.toLocaleString()}</p>
              </div>
              <MessageCircle size={32} className="text-[#00F7FF] opacity-50" />
            </div>
          </Card>

          <Card className="prophet-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Posts</p>
                <p className="text-3xl font-bold text-[#FA00FF]">{totalPosts}</p>
              </div>
              <TrendingUp size={32} className="text-[#FA00FF] opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart */}
          <Card className="prophet-card p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Weekly Engagement</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={postData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00F7FF20" />
                <XAxis stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #00F7FF",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#00F7FF" strokeWidth={2} />
                <Line type="monotone" dataKey="likes" stroke="#FA00FF" strokeWidth={2} />
                <Line type="monotone" dataKey="comments" stroke="#FF6B9D" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie Chart */}
          <Card className="prophet-card p-6">
            <h2 className="text-xl font-bold mb-4">Posts by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#000",
                    border: "1px solid #00F7FF",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bar Chart */}
        <Card className="prophet-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Daily Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={postData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00F7FF20" />
              <XAxis stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid #00F7FF",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="views" fill="#00F7FF" />
              <Bar dataKey="likes" fill="#FA00FF" />
              <Bar dataKey="comments" fill="#FF6B9D" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Posts */}
        <Card className="prophet-card p-6">
          <h2 className="text-xl font-bold mb-4">Top Performing Posts</h2>
          <div className="space-y-3">
            {topPosts.map((post, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-black/50 rounded-lg transition">
                <div>
                  <p className="font-semibold text-white">{post.title}</p>
                  <div className="flex gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye size={14} /> {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={14} /> {post.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} /> {post.comments.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#00F7FF] font-bold">{Math.round((post.views / 1500) * 100)}%</p>
                  <p className="text-xs text-gray-500">engagement</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
