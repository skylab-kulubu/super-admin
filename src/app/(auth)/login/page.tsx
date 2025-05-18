"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";
import toast from "react-hot-toast";
import axios from "axios"; // Using global axios for this specific call, or use the instance from lib/axios
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type LoginFormInputs = {
  username: string; // Changed from email to username
  sifre: string; // "Şifre" field, matching API or transforming
};

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://api.yildizskylab.com/api/auth/login",
        {
          username: data.username, // Now directly using data.username
          password: data.sifre,
        }
      );
      
      // Correctly extract token from response.data.data
      const token = response.data.data; 

      if (!token || typeof token !== 'string') { // Add a type check for robustness
        throw new Error("Token bulunamadı veya geçersiz formatta.");
      }

      setCookie(null, "token", token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // httpOnly: true, // As noted, client-side cannot truly set HttpOnly. 
                        // API should set this if HttpOnly is desired.
      });
      
      auth.login(token); // Update auth context
      toast.success("Giriş başarılı!");
      
      // Redirect based on role
      const redirectPath = auth.getRedirectPath(); // This needs user to be set in context first
                                                // Let's decode token here for immediate redirect info
      const { jwtDecode } = await import("jwt-decode"); // Dynamic import for client component
      const decoded = jwtDecode<{ roles: string[] }>(token);
      
      const roleToPathMap: Record<string, string> = {
        ROLE_BIZBIZE_ADMIN: "/bizbize",
        ROLE_GECEKODU_ADMIN: "/gecekodu",
        ROLE_AGC_ADMIN: "/agc",
        ROLE_ADMIN: "/" // Add a default for ROLE_ADMIN if they don't have a specific tenant role
      };
      let path = "/"; // Default dashboard
      // Prioritize specific admin roles, then general admin, then default
      if (decoded.roles.includes("ROLE_BIZBIZE_ADMIN")) {
        path = roleToPathMap["ROLE_BIZBIZE_ADMIN"];
      } else if (decoded.roles.includes("ROLE_GECEKODU_ADMIN")) {
        path = roleToPathMap["ROLE_GECEKODU_ADMIN"];
      } else if (decoded.roles.includes("ROLE_AGC_ADMIN")) {
        path = roleToPathMap["ROLE_AGC_ADMIN"];
      } else if (decoded.roles.includes("ROLE_ADMIN")) {
        path = roleToPathMap["ROLE_ADMIN"];
      }
      
      router.push(path);

    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        Giriş Yap
      </h2>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Kullanıcı Adı" // Changed label
          type="text" // Changed type
          autoComplete="username" // Changed autoComplete
          {...register("username", { required: "Kullanıcı Adı alanı zorunludur." })} // Changed field name and message
          error={errors.username?.message} // Changed error field
        />
        <Input
          label="Şifre"
          type="password"
          autoComplete="current-password"
          {...register("sifre", { required: "Şifre alanı zorunludur." })}
          error={errors.sifre?.message}
        />
        <div>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Giriş Yap
          </Button>
        </div>
      </form>
    </div>
  );
}
