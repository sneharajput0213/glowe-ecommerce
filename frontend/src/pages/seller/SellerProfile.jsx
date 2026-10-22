
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  Save,
  X,
} from "lucide-react";
import api from "../../utils/api";

function SellerProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");

        setUser(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleCancel = () => {
    setForm({
      name: user.name || "",
      phone: user.phone || "",
    });
    setEditing(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const phone = form.phone.trim();

    if (name.length < 2 || name.length > 100) {
      setError("Name must be between 2 and 100 characters.");
      return;
    }

    if (phone.length < 7 || phone.length > 20) {
      setError("Phone number must be between 7 and 20 characters.");
      return;
    }

    try {
      setSaving(true);

      const { data } = await api.put("/auth/profile", {
        name,
        phone,
      });

      setUser(data.user);
      setForm({
        name: data.user.name,
        phone: data.user.phone,
      });

      // Keep locally displayed account information up to date.
      const storedUser = JSON.parse(
        localStorage.getItem("userInfo") || "{}"
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...storedUser,
          name: data.user.name,
        })
      );

      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading profile...</p>;
  }

  if (!user) {
    return (
      <p role="alert" className="text-red-500">
        {error || "Profile not found."}
      </p>
    );
  }

  const details = [
    { label: "Full Name", value: user.name, icon: UserRound },
    { label: "Email Address", value: user.email, icon: Mail },
    { label: "Phone Number", value: user.phone, icon: Phone },
    { label: "Account Role", value: user.role, icon: ShieldCheck },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your Glowé seller account information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setSuccess("");
              setError("");
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl"
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-red-500">{error}</p>
      )}

      {success && (
        <p role="status" className="text-green-600">{success}</p>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-primary/10 p-8 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-semibold">
            {user.name?.charAt(0).toUpperCase() || "S"}
          </div>

          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <span className="inline-block mt-2 text-xs font-medium uppercase tracking-wide text-primary">
              Seller Account
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
            <div>
              <label htmlFor="seller-name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                id="seller-name"
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
                minLength={2}
                maxLength={100}
                className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label htmlFor="seller-phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                id="seller-phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                required
                minLength={7}
                maxLength={20}
                className="w-full border border-border bg-background rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Email address and account role cannot be changed here.
            </p>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 border border-border px-5 py-3 rounded-xl disabled:opacity-50"
              >
                <X size={18} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {details.map((detail) => {
              const Icon = detail.icon;

              return (
                <div
                  key={detail.label}
                  className="border border-border rounded-xl p-5"
                >
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Icon size={18} />
                    <span className="text-sm">{detail.label}</span>
                  </div>

                  <p className="font-medium break-words">
                    {detail.value || "Not provided"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProfile;
