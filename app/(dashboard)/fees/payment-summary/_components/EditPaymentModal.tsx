'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { EditablePayment } from './PaymentSummaryTable';
import { handlePaymentUpdate,ResponseState } from '@/actions/fees/update-payment';

const paymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.date(),
  paymentType: z.string(),
  status: z.string(),
  reference: z.string().optional(),
  description: z.string().optional()
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payment: EditablePayment;
}

export default function EditPaymentModal({ isOpen, onClose, payment }: Props) {
  const router = useRouter();
  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: payment.amount,
      paymentDate: new Date(payment.paymentDate),
      paymentType: payment.paymentType,
      status: payment.status,
      reference: payment.reference,
      description: payment.description
    }
  });

  const onSubmit = handleSubmit(async (formData) => {
    const responseState = await handlePaymentUpdate({
      paymentId: payment.id,
      ...formData
    });
    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success('Payment has been updated!');
      onClose();
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || 'Failed to update payment');
    }
  }, [state, router, onClose]);

  return (
    <div className={`${isOpen ? 'fixed' : 'hidden'} inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Edit Payment</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Date
            </label>
            <input
              type="date"
              {...register("paymentDate", { valueAsDate: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Type
            </label>
            <select
              {...register("paymentType")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              {...register("status")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reference
            </label>
            <input
              type="text"
              {...register("reference")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              {...register("description")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-md"
            >
              {isSubmitting ? 'Updating...' : 'Update Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}