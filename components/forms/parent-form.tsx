"use client";

// import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";
import InputField from "../input-field";
import {
  // parentSchema,
  ParentSchema,
  // parentUpdateSchema,
} from "@/schemas/parent-schema";
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
  // Conditional type for form data schema
  // const schema = type === "create" ? parentSchema : parentUpdateSchema;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting  },
  } = useForm<ParentSchema>({
    // resolver: zodResolver(schema),
    defaultValues: data,
  });

  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const [img, setImg] = useState<any>(data?.img);
  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Submitting form:", formData);
    let responseState: ResponseState;
    // const cleanedFormData = Object.fromEntries(
    //   Object.entries(formData).filter(([_, v]) => v != null)
    // );

    if (type === "create") {
      responseState = await createParent({
        ...formData,
        img: img?.secure_url || img,
      });
    } else {
      console.log("Updating parent", formData);
      responseState = await updateParent({
        ...formData,
        img: img?.secure_url || img,
      });
    }

    console.log("Response state:", responseState);
    setState(responseState);
  });

  useEffect(() => {
    console.log(type);
    if (state.success) {
      toast.success(`Parent has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      if (state.messages && state.messages.length) {
        state.messages.forEach((message: string) => toast.error(message));
      } else {
        toast.error(state.message || "Something went wrong!");
      }
    }
  }, [state, router, type, setOpen]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new parent" : "Update the parent"}
      </h1>

      <div className="flex gap-4 flex-wrap">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        {type === "create" && (
          <InputField
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
          />
        )}
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors?.phone}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
      </div>
      {data && (
        <InputField
          label="Id"
          name="id"
          defaultValue={data?.id}
          register={register}
          error={errors?.id}
          hidden
        />
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
          {({ open }) => {
            return (
              <div
                className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                onClick={() => open()}
              >
                <Image src="/upload.png" alt="" width={28} height={28} />
                <span>Upload a photo</span>
              </div>
            );
          }}
        </CldUploadWidget>
        {img && (
          <Image
            src={img.secure_url || img}
            alt="Teacher photo"
            width={100}
            height={100}
            className="mt-2 rounded-md"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors?.surname}
        />

        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors?.address}
        />
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
