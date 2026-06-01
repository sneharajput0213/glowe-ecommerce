import { useEffect, useState } from "react";
import { User, Mail, ShieldCheck } from "lucide-react";

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("userInfo");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        // because backend response is:
        // { success, token, user }

        if (parsedUser) {
          setUserInfo(parsedUser);
        }
      }
    } catch (error) {
      console.log("Error loading user:", error);
      localStorage.removeItem("userInfo");
    }
  }, []);

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-3xl p-10 text-center max-w-md w-full">
          <h2 className="text-3xl font-serif text-foreground mb-4">
            Not Logged In
          </h2>

          <p className="text-muted-foreground">
            Please login to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-14 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-5xl font-serif text-foreground">
            My Profile
          </h1>

          <p className="text-muted-foreground mt-3">
            Manage your Glowé account details
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">

          {/* Top Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 pb-8 border-b border-border">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-semibold">
              {userInfo?.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-3xl font-serif text-foreground">
                {userInfo?.name}
              </h2>

              <p className="text-muted-foreground mt-2">
                Welcome back to Glowé ✨
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">

            {/* Name */}
            <div className="bg-accent/40 rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-primary" />

                <span className="text-sm text-muted-foreground">
                  Full Name
                </span>
              </div>

              <p className="text-lg text-foreground font-medium">
                {userInfo?.name}
              </p>
            </div>

            {/* Email */}
            <div className="bg-accent/40 rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-primary" />

                <span className="text-sm text-muted-foreground">
                  Email Address
                </span>
              </div>

              <p className="text-lg text-foreground font-medium break-all">
                {userInfo?.email}
              </p>
            </div>

            {/* Account Status */}
            <div className="bg-accent/40 rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />

                <span className="text-sm text-muted-foreground">
                  Account Status
                </span>
              </div>

              <p className="text-lg text-green-600 font-medium">
                Active
              </p>
            </div>

            {/* User ID */}
            <div className="bg-accent/40 rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-primary font-semibold">
                  #
                </span>

                <span className="text-sm text-muted-foreground">
                  User ID
                </span>
              </div>

              <p className="text-sm text-foreground break-all">
                {userInfo?.id}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}