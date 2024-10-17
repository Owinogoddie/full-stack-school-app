// components/FeePaymentForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { z } from "zod";
import InputField from "../input-field";
import SelectField from "../select-field";
// import { recordFeePayment } from "@/actions/fee-actions";

const feePaymentSchema = z.object({
  studentId: z.string().uuid(),
  feeItemId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CHEQUE"]),
});

type FeePaymentSchema = z.infer<typeof feePaymentSchema>;

type FeeItem = {
  id: string;
  feeType: { name: string };
  amount: number;
  finalAmount: number;
  dueDate: string;
};

type FeePaymentFormProps = {
  studentId: string;
  studentName: string;
  feeItems: FeeItem[];
};

const FeePaymentForm = ({ studentId, studentName, feeItems }: FeePaymentFormProps) => {
  const {
    register,
    handleSubmit,
    // control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FeePaymentSchema>({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: {
      studentId,
      feeItemId: "",
      amount: 0,
      paymentMethod: "CASH",
    },
  });

  const [state] = useState({ success: false, error: false, message: "" });
  const router = useRouter();

  const watchFeeItemId = watch("feeItemId");

  const selectedFeeItem = feeItems.find(item => item.id === watchFeeItemId);
  const remainingAmount = selectedFeeItem ? selectedFeeItem.amount - selectedFeeItem.finalAmount : 0;

  const onSubmit = handleSubmit(async () => {
    // const responseState = await recordFeePayment(formData);
    // setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Fee payment recorded successfully!");
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router]);

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold">Record Fee Payment for {studentName}</h2>

      <input type="hidden" {...register("studentId")} />

      <SelectField
        label="Fee Type"
        name="feeItemId"
        register={register}
        setValue={setValue}
        error={errors.feeItemId}
        options={feeItems.map(item => ({
          value: item.id,
          label: `${item.feeType.name} - Due: ${item.amount} - Paid: ${item.finalAmount}`,
        }))}
      />

      {selectedFeeItem && (
        <div className="text-sm">
          Remaining amount to pay: {remainingAmount}
        </div>
      )}

      <InputField
        label="Amount"
        name="amount"
        register={register}
        error={errors.amount}
        type="number"
        // max={remainingAmount}
      />

      <SelectField
        label="Payment Method"
        name="paymentMethod"
        register={register}
        setValue={setValue}
        error={errors.paymentMethod}
        options={[
          { value: "CASH", label: "Cash" },
          { value: "BANK_TRANSFER", label: "Bank Transfer" },
          { value: "MOBILE_MONEY", label: "Mobile Money" },
          { value: "CHEQUE", label: "Cheque" },
        ]}
      />

      <button
        type="submit"
        className="bg-green-500 text-white p-2 rounded-md"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Recording Payment..." : "Record Payment"}
      </button>

      {state.error && (
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
          <span className="text-sm text-red-600">{state.message}</span>
        </div>
      )}
    </form>
  );
};

export default FeePaymentForm;