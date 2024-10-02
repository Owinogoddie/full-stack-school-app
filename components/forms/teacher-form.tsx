"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../input-field";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";
import {
  TeacherSchema,
  teacherSchema,
  teacherUpdateSchema,
} from "@/schemas/teacher-schema";
import MultiSelect from "../multi-select";
import { createTeacher, updateTeacher } from "@/actions/teacher-actions";
import SelectField from "../select-field";

// Type for the response state
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
  // Conditional type for form data schema
  const schema = type === "create" ? teacherSchema : teacherUpdateSchema;

  // Set up form handling with react-hook-form
  console.log(relatedData.subjects);
  console.log(data.subjects);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      birthday: data?.birthday?.toISOString().split("T")[0],
      subjects:
        data?.subjects?.map((subject: any) => subject.id.toString()) ||
        relatedData?.subjects?.map((subject: any) => subject.id.toString()) ||
        [],
    },
  });
  // console.log(relatedData)
  const [img, setImg] = useState<any>(data?.img);
  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  // Submit handler for the form
  const onSubmit = handleSubmit(async (formData) => {
    console.log("Submitting form:", formData);
    let responseState: ResponseState;

    if (type === "create") {
      responseState = await createTeacher({
        ...formData,
        img: img?.secure_url || img,
      });
    } else {
      console.log("Updating teacher", formData);
      responseState = await updateTeacher({
        ...formData,
        img: img?.secure_url || img,
      });
    }

    console.log("Response state:", responseState);
    setState(responseState);
  });

  const router = useRouter();

  // Handle side effects after form submission
  useEffect(() => {
    console.log(type);
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

  // Destructure related data like subjects
  const { subjects } = relatedData;
  const formattedBirthday = data?.birthday
    ? new Date(data.birthday).toISOString().split("T")[0]
    : undefined;
  console.log(formattedBirthday);
  console.log(
    "Birthday Default Value:",
    data?.birthday?.toISOString().split("T")[0]
  );

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>

      {/* Authentication Information */}
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
        {type === "create" && (
          <InputField
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
          />
        )}
      </div>

      {/* Personal Information */}
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
          defaultValue={
            data?.birthday ? data.birthday.toISOString().split("T")[0] : ""
          }
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

        <SelectField
          label="Sex"
          options={[
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
          ]}
          name="sex"
          register={register}
          setValue={setValue}
          error={errors.sex}
          defaultValue={data?.sex}
        />
        {/* MultiSelect Component for Subjects */}
        <Controller
          name="subjects"
          control={control}
          render={({ field }) => {
            console.log("field.value:", field.value); // Debug log

            return (
              <MultiSelect
                label="Subjects"
                options={subjects.map((subject: any) => ({
                  id: subject.id.toString(),
                  label: subject.name,
                }))}
                value={field.value || []}
                onChange={(newValue) => {
                  console.log("New value:", newValue); // Debug log
                  field.onChange(newValue);
                }}
                error={errors.subjects}
              />
            );
          }}
        />

        {/* Image Upload Section */}
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
          {/* Conditional rendering for image or no image message */}
          {img ? (
            <Image
              src={img.secure_url || img}
              alt="Teacher photo"
              width={50}
              height={50}
              className="mt-2 rounded-md"
            />
          ) : data?.img ? (
            <Image
              src={data.img}
              alt="Teacher photo"
              width={50}
              height={50}
              className="mt-2 rounded-md"
            />
          ) : (
            <span className="text-gray-500 mt-2 text-xs">
              No image available
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
          <h2 className="text-red-600 font-semibold">Error:</h2>
          {state.messages ? (
            <ul className="list-disc list-inside text-red-500">
              {state.messages.map((message, index) => (
                <li key={index} className="text-sm">
                  {message}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm">
              {state.message || "Something went wrong!"}
            </span>
          )}
        </div>
      )}

      {/* Submit Button */}
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
        ) : type === "create" ? (
          "Create"
        ) : (
          "Update"
        )}
      </button>
    </form>
  );
};

export default TeacherForm;
