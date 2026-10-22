
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import api from "../utils/api";

export default function SellerRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    storeName: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register-seller", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        storeName: form.storeName,
        password: form.password,
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit your application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Full Name",
      name: "name",
      type: "text",
      icon: UserRound,
      placeholder: "Your full name",
    },
    {
      label: "Email Address",
      name: "email",
      type: "email",
      icon: Mail,
      placeholder: "you@example.com",
    },
    {
      label: "Phone Number",
      name: "phone",
      type: "tel",
      icon: Phone,
      placeholder: "Your phone number",
    },
    {
      label: "Store Name",
      name: "storeName",
      type: "text",
      icon: Store,
      placeholder: "Your business or store name",
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      icon: LockKeyhole,
      placeholder: "Minimum 8 characters",
    },
    {
      label: "Confirm Password",
      name: "confirmPassword",
      type: "password",
      icon: LockKeyhole,
      placeholder: "Re-enter your password",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F7] px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEDEF] text-[#B76E79]">
            <Store size={30} />
          </div>

          <p className="mb-3 text-sm font-medium tracking-widest text-[#B76E79] uppercase">
            Partner with Glowé
          </p>

          <h1 className="font-serif text-4xl text-gray-900 sm:text-5xl">
            Become a Seller
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-500">
            Join the Glowé marketplace and start sharing your
            products with our customers. Create your seller
            account to get started.
          </p>
        </div>

        {success ? (
          /* Success Message */
          <div
            role="status"
            className="rounded-3xl border border-[#F0E5E5] bg-white p-8 text-center shadow-sm sm:p-12"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={38} />
            </div>

            <h2 className="font-serif text-3xl text-gray-900">
              Application Submitted!
            </h2>

            <p className="mx-auto mt-4 max-w-md leading-7 text-gray-500">
              Thank you for applying to become a Glowé seller.
              Your application is awaiting admin approval.
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Once your account is approved, you can sign in
              using the email and password you registered with.
            </p>

            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#B76E79] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#A45D69]"
            >
              Back to Home
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          /* Registration Form */
          <div className="rounded-3xl border border-[#F0E5E5] bg-white p-6 shadow-sm sm:p-10">
            <div className="mb-8">
              <h2 className="font-serif text-2xl text-gray-900">
                Seller Registration
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Fill in your details to submit your application.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {fields.map((field) => {
                  const Icon = field.icon;

                  return (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {field.label}
                      </label>

                      <div className="relative">
                        <Icon
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          id={field.name}
                          name={field.name}
                          type={field.type}
                          value={form[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          required
                          minLength={
                            field.name === "password" ? 8 : undefined
                          }
                          autoComplete={
                            field.name === "confirmPassword"
                              ? "new-password"
                              : undefined
                          }
                          className="w-full rounded-xl border border-[#F0E5E5] bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#B76E79]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              <div className="rounded-xl bg-[#FAF3F4] p-4">
                <p className="text-sm leading-6 text-[#97505D]">
                  Your application will be reviewed by the
                  Glowé administration team before you can
                  access your Seller Dashboard.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B76E79] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#A45D69] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Submitting Application..."
                  : "Submit Seller Application"}

                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
