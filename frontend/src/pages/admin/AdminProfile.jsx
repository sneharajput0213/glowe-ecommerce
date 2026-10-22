
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

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

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
        name: data.user.name || "",
        phone: data.user.phone || "",
      });

      const storedUser = JSON.parse(
        localStorage.getItem("userInfo") || "{}"
      );

      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...storedUser,
          name: data.user.name,
          phone: data.user.phone,
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
    return (
      <p className="text-gray-500">
        Loading profile...
      </p>
    );
  }

  if (!user) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600"
      >
        {error || "Profile not found."}
      </div>
    );
  }

  const details = [
    {
      label: "Full Name",
      value: user.name,
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: user.email,
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: user.phone,
      icon: Phone,
    },
    {
      label: "Account Role",
      value: user.role,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-[#B76E79]">
            Glowé Administration
          </p>

          <h1 className="font-serif text-3xl text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your administrator account information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#B76E79] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#A45F6B]"
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-[#F0E5E5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-5 bg-[#FAE9EC] p-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#B76E79] text-3xl font-semibold text-white">
            {user.name?.charAt(0).toUpperCase() || "A"}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {user.name}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {user.email}
            </p>

            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#B76E79]">
              <ShieldCheck size={14} />
              Administrator
            </span>
          </div>
        </div>

        {editing ? (
          <form
            onSubmit={handleSave}
            className="space-y-6 p-6 md:p-8"
          >
            <div>
              <label
                htmlFor="admin-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="admin-name"
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
                className="w-full rounded-xl border border-[#F0E5E5] bg-white px-4 py-3 outline-none focus:border-[#B76E79]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>

              <input
                id="admin-phone"
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
                className="w-full rounded-xl border border-[#F0E5E5] bg-white px-4 py-3 outline-none focus:border-[#B76E79]"
              />
            </div>

            <p className="text-sm text-gray-500">
              Email address and account role cannot be changed here.
            </p>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-[#F0E5E5] px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <X size={18} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#B76E79] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#A45F6B] disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 md:p-8">
            {details.map((detail) => {
              const Icon = detail.icon;

              return (
                <div
                  key={detail.label}
                  className="rounded-xl border border-[#F0E5E5] p-5"
                >
                  <div className="mb-3 flex items-center gap-2 text-gray-500">
                    <Icon size={18} />
                    <span className="text-sm">
                      {detail.label}
                    </span>
                  </div>

                  <p className="break-words font-medium capitalize text-gray-900">
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
