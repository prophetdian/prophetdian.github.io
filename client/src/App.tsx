import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Navigation from "./components/Navigation";
import Feed from "./pages/Feed";
import Shop from "./pages/Shop";
import Courses from "./pages/Courses";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Checkout from "./pages/Checkout";
import NaviSociety from "./pages/NaviSociety";
import UserProfile from "./pages/UserProfile";
import HorizontalNav from "./components/HorizontalNav";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import EditPost from "./pages/EditPost";
import ContentModeration from "./pages/ContentModeration";
import BlockedUsers from "./pages/BlockedUsers";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import Login from "./pages/Login";
import NaviCheckout from "./pages/NaviCheckout";
import ProfileEdit from "./pages/ProfileEdit";
import NaviSocietyFeed from "./pages/NaviSocietyFeed";
import DirectMessages from "./pages/DirectMessages";
import BadgeShop from "./pages/BadgeShop";
import BadgeCheckout from "./pages/BadgeCheckout";
import NaviSocietyCheckout from "./pages/NaviSocietyCheckout";
import PaymentSuccess from "./pages/PaymentSuccess";
import SubscriptionsDashboard from "./pages/SubscriptionsDashboard";

import { useAuth } from "./_core/hooks/useAuth";


function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/feed" component={Feed} />
      <Route path="/shop" component={Shop} />
      <Route path="/courses" component={Courses} />
      <Route path="/profile" component={Profile} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/navi-society" component={NaviSociety} />
      <Route path="/navi-feed" component={NaviSocietyFeed} />
      <Route path="/navi-checkout" component={NaviSocietyCheckout} />
      <Route path="/navi-society-checkout" component={NaviSocietyCheckout} />
      <Route path="/badge-shop" component={BadgeShop} />
      <Route path="/badge-checkout" component={BadgeCheckout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/payment-status" component={SubscriptionsDashboard} />
      <Route path="/messages" component={DirectMessages} />
      <Route path="/badges" component={BadgeShop} />
      <Route path="/user/:userId" component={UserProfile} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/edit-post/:id" component={EditPost} />
      <Route path="/profile-edit" component={ProfileEdit} />
      <Route path="/blocked-users" component={BlockedUsers} />
      <Route path="/subscriptions" component={SubscriptionManagement} />
      {user?.role === "admin" && <Route path="/admin" component={AdminDashboard} />}
      {user?.role === "admin" && <Route path="/analytics" component={Analytics} />}
      {user?.role === "admin" && <Route path="/moderation" component={ContentModeration} />}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen flex flex-col bg-black text-white">
            <HorizontalNav />
            <Navigation />
            <main className="flex-1">
              <Router />
            </main>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
