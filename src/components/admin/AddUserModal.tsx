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
  usernameOrEmail: string;
  password?: string; // Optional if API generates one or it's set later
};

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddUserFormInputs>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<AddUserFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      // API expects username and password. If password is not provided,
      // ensure your API handles this (e.g., by generating one or erroring).
      // For this example, we'll make password required.
      if (!data.password) {
        toast.error("Şifre alanı zorunludur.");
        setIsLoading(false);
        return;
      }
      await api.post('/users/addUser', data);
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
            id="usernameOrEmail" // Added id
            type="text"
            {...register('usernameOrEmail', { required: 'Kullanıcı adı zorunludur.' })}
            error={errors.usernameOrEmail?.message}
          />
          <Input
            label="Şifre"
            id="password" // Added id
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
