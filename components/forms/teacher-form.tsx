"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../input-field";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";
import { TeacherSchema, teacherSchema } from "@/schemas/teacher-schema";
import { createTeacher, updateTeacher } from "@/actions/teacher-actions";
import MultiSelect from "../multi-select";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const TeacherForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: data,
  });

  const [img, setImg] = useState<any>(data?.img);

  const [state, formAction] = useFormState<ResponseState, TeacherSchema>(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    formAction({ 
      ...formData, 
      img: img?.secure_url || img 
    });
  });
  
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Teacher has been ${type === "create" ? "created" : "updated"}!`
      );
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

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday?.toISOString().split("T")[0]}
          register={register}
          error={errors.birthday}
          type="date"
        />
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
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        {/* <MultiSelect
          label="Subjects"
          options={subjects.map((subject: any) => ({
            id: subject.id,
            label: subject.name,
          }))}
          name="subjects"
          register={register}
          error={
            Array.isArray(errors.subjects)
              ? errors.subjects[0]
              : errors.subjects
          } // Safely handle the error
          defaultValue={data?.subjects?.map((subject: any) => subject.id) || []}
        /> */}
        <Controller
        name="subjects"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Subjects"
            options={subjects.map((subject: any) => ({
              id: subject.id,
              label: subject.name,
            }))}
            error={errors.subjects}
            {...field}
          />
        )}
      />

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
      </div>
      {state.error && (
        <div className="text-red-500">
          {state.messages ? (
            <ul>
              {state.messages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          ) : (
            <span>{state.message || "Something went wrong!"}</span>
          )}
        </div>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
