"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

type ChangePasswordFormInputs = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormInputs>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const newPassword = watch("newPassword");

  const onSubmit: SubmitHandler<ChangePasswordFormInputs> = async (data) => {
    try {
      await api.post('/users/changePassword', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Şifreniz başarıyla değiştirildi!');
      reset();
      // Optionally redirect or provide further instructions
    } catch (error: any) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu.');
    }
  };
  
  if (authLoading) {
    return <div className="p-6 text-center">Yükleniyor...</div>;
  }

  if (!user) {
    router.replace('/login'); // Should be handled by layout, but good fallback
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
        Şifre Değiştir
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Mevcut Şifre"
          id="oldPassword"
          type="password"
          {...register('oldPassword', { required: 'Mevcut şifre zorunludur.' })}
          error={errors.oldPassword?.message}
        />
        <Input
          label="Yeni Şifre"
          id="newPassword"
          type="password"
          {...register('newPassword', { 
            required: 'Yeni şifre zorunludur.',
            minLength: { value: 6, message: 'Yeni şifre en az 6 karakter olmalıdır.' }
          })}
          error={errors.newPassword?.message}
        />
        <Input
          label="Yeni Şifre (Tekrar)"
          id="confirmPassword"
          type="password"
          {...register('confirmPassword', {
            required: 'Yeni şifreyi tekrar girin.',
            validate: value => value === newPassword || 'Yeni şifreler eşleşmiyor.'
          })}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting} variant="primary">
          Şifreyi Değiştir
        </Button>
      </form>
    </div>
  );
}
