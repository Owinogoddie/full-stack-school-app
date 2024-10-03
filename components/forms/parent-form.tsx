"use client";

import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";
import InputField from "../input-field";
import { ParentSchema } from "@/schemas/parent-schema";
import { createParent, updateParent } from "@/actions/parent-actions";
import Image from "next/image";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const ParentForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
    clearErrors,
  } = useForm<ParentSchema>({
    defaultValues: data,
  });

  const [state, setState] = useState<ResponseState>({ success: false, error: false });
  const [img, setImg] = useState<any>(data?.img);
  const router = useRouter();
  const password = watch("password");
  const repeatPassword = watch("repeatPassword");

  useEffect(() => {
    if (password && repeatPassword) {
      if (password !== repeatPassword) {
        setError("repeatPassword", {
          type: "manual",
          message: "Passwords do not match!",
        });
      } else {
        clearErrors("repeatPassword");
      }
    }
  }, [password, repeatPassword, setError, clearErrors]);
  const onSubmit = handleSubmit(async (formData) => {
    let responseState: ResponseState;

    if (type === "create") {
      responseState = await createParent({
        ...formData,
        img: img?.secure_url || img,
      });
    } else {
      responseState = await updateParent({
        ...formData,
        img: img?.secure_url || img,
      });
    }

    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Parent has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new parent" : "Update the parent"}
      </h1>

      {/* Parent Information */}
      <div>
        <span className="text-xs text-gray-400 font-medium">Parent Information</span>
        <div className="flex flex-wrap gap-4 mt-2">
          <InputField
            label="First Name"
            name="firstName"
            defaultValue={data?.firstName}
            register={register}
            error={errors.firstName}
            placeholder="Enter First Name"
          />
          <InputField
            label="Last Name"
            name="lastName"
            defaultValue={data?.lastName}
            register={register}
            error={errors.lastName}
            placeholder="Enter Last Name"
          />
          <InputField
            label="National ID"
            name="nationalId"
            defaultValue={data?.nationalId}
            register={register}
            error={errors.nationalId}
            placeholder="Enter National ID"
          />
          <InputField
            label="Email"
            name="email"
            defaultValue={data?.email}
            register={register}
            error={errors.email}
            placeholder="Enter Email"
          />
          <InputField
            label="Phone"
            name="phone"
            defaultValue={data?.phone}
            register={register}
            error={errors.phone}
            placeholder="Enter Phone Number"
          />
          
          <InputField
            label="Address"
            name="address"
            defaultValue={data?.address}
            register={register}
            error={errors.address}
            placeholder="Enter Address"
          />
          {type === "create" && (
            <>
              <InputField
                label="Password"
                name="password"
                type="password"
                register={register}
                error={errors.password}
                placeholder="Enter password"
              />
              <InputField
                label="Repeat Password"
                name="repeatPassword"
                type="password"
                register={register}
                error={errors.repeatPassword}
                placeholder="Enter password again"
              />
              {errors.repeatPassword && (
                <p className="text-red-500 text-xs">
                  {errors.repeatPassword.message}
                </p>
              )}
            </>
          )}
         
      <div className="flex flex-col gap-2 w-full md:w-1/2">
        <label className="text-xs text-gray-500">Photo</label>
        <CldUploadWidget
          uploadPreset="ex-academy"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => (
            <div
              className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="" width={28} height={28} />
              <span>Upload a photo</span>
            </div>
          )}
        </CldUploadWidget>
        {img && (
          <Image
            src={img.secure_url || img}
            alt="Parent photo"
            width={50}
            height={50}
            className="mt-2 rounded-md"
          />
        )}
      </div>
        </div>
      </div>


      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md relative"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="opacity-0">
              {type === "create" ? "Create" : "Update"}
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
            </div>
          </>
        ) : (
          type === "create" ? "Create" : "Update"
        )}
      </button>
    </form>
  );
};

export default ParentForm;
