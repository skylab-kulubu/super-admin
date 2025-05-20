"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void; // Callback to refresh user list
}

type AddUserFormInputs = {
  username: string; // Changed from usernameOrEmail
  email: string;
  password?: string; 
};

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddUserFormInputs>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<AddUserFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      if (!data.password) {
        toast.error("Şifre alanı zorunludur.");
        setIsLoading(false);
        return;
      }
      // API expects username, password, email
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
      };
      await api.post('/users/addUser', payload);
      toast.success('Kullanıcı başarıyla eklendi!');
      onUserAdded();
      reset();
      onClose();
    } catch (error: any) {
      console.error("Add user error:", error);
      const errorMessage = error.response?.data?.message || 'Kullanıcı eklenirken bir hata oluştu.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Yeni Kullanıcı Ekle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Kullanıcı Adı"
            id="username" // Changed id
            type="text"
            {...register('username', { required: 'Kullanıcı adı zorunludur.' })} // Changed field name
            error={errors.username?.message}
          />
          <Input
            label="E-posta"
            id="email"
            type="email"
            {...register('email', { 
              required: 'E-posta zorunludur.',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Geçersiz e-posta adresi"
              }
            })}
            error={errors.email?.message}
          />
          <Input
            label="Şifre"
            id="password"
            type="password"
            {...register('password', { required: 'Şifre zorunludur.', minLength: { value: 6, message: "Şifre en az 6 karakter olmalıdır."} })}
            error={errors.password?.message}
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              İptal
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              Ekle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
