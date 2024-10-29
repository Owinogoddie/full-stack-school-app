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
import {
  qualificationsOptions,
  specializationsOptions,
} from "@/lib/teacher-options";
import Switch from "../switch";
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
  const schema = type === "create" ? teacherSchema : teacherUpdateSchema;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
    watch, // Watch function
    setError, // Set custom error
    clearErrors, // Clear custom error
  } = useForm<TeacherSchema>({
    resolver: zodResolver(schema),

    defaultValues: {
      ...data,
      dateOfBirth: data?.dateOfBirth?.toISOString().split("T")[0],
      hireDate: data?.hireDate?.toISOString().split("T")[0],
      subjects:
        data?.subjects?.map((subject: any) => subject.id.toString()) || [],
      // classes: data?.classes?.map((cls: any) => cls.id.toString()) || [],
    },
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [img, setImg] = useState<any>(data?.img);
  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

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
    if (formData.password && formData.password !== formData.repeatPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createTeacher({
        ...formData,
        img: img?.secure_url || img,
      });
    } else {
      responseState = await updateTeacher({
        ...formData,
        img: img?.secure_url || img,
      });
    }

    setState(responseState);
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
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
    }
  }, [errors]);
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
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
          placeholder="Enter Email e.g xxx@ccc.com"
          fullWidth
        />
        <InputField
          label="user Name"
          name="userName"
          defaultValue={data?.userName}
          register={register}
          error={errors?.userName}
          placeholder="Enter user Name"
          fullWidth
        />
        {/* Password Fields Section */}
        {type === "create" ? (
          <div className="flex flex-wrap gap-4">
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
          </div>
        ) : (
          <div className="space-y-4">
            <Switch
              label="Change Password"
              checked={showPasswordFields}
              onChange={setShowPasswordFields}
            />

            {showPasswordFields && (
              <div className="flex flex-wrap gap-4">
                <InputField
                  label="New Password"
                  name="password"
                  type="password"
                  register={register}
                  error={errors.password}
                  placeholder="Enter new password"
                />
                <InputField
                  label="Confirm New Password"
                  name="repeatPassword"
                  type="password"
                  register={register}
                  error={errors.repeatPassword}
                  placeholder="Confirm new password"
                />
                {errors.repeatPassword && (
                  <p className="text-red-500 text-xs">
                    {errors.repeatPassword.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personal Information */}
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="TSC Number"
          name="tscNumber"
          defaultValue={data?.tscNumber}
          register={register}
          error={errors.tscNumber}
          placeholder="Enter TSC NO"
        />
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
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
          placeholder="Enter Phone"
        />
        <InputField
          label="National ID"
          name="nationalId"
          defaultValue={data?.nationalId}
          register={register}
          error={errors.nationalId}
          placeholder="Enter National Id"
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
          placeholder="Enter your adress"
        />
        <InputField
          label="Date of Birth"
          name="dateOfBirth"
          defaultValue={data?.dateOfBirth?.toISOString().split("T")[0]}
          register={register}
          error={errors.dateOfBirth}
          type="date"
          fullWidth
        />
        <SelectField
          label="Gender"
          options={[
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
            { value: "OTHER", label: "Other" },
          ]}
          name="gender"
          register={register}
          setValue={setValue}
          error={errors.gender}
          defaultValue={data?.gender}
        />
      </div>

      {/* Employment Information */}
      <span className="text-xs text-gray-400 font-medium">
        Employment Information
      </span>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Hire Date"
          name="hireDate"
          defaultValue={data?.hireDate?.toISOString().split("T")[0]}
          register={register}
          error={errors.hireDate}
          type="date"
          fullWidth
        />
        <SelectField
          label="Employment Status"
          options={[
            { value: "FULL_TIME", label: "Full Time" },
            { value: "PART_TIME", label: "Part Time" },
            { value: "CONTRACT", label: "Contract" },
          ]}
          name="employmentStatus"
          register={register}
          setValue={setValue}
          error={errors.employmentStatus}
          defaultValue={data?.employmentStatus}
        />
        <SelectField
          label="Department"
          options={relatedData.departments.map((department: any) => ({
            value: department.id,
            label: `${department.name}`,
          }))} // Mapping related data for teachers
          name="departmentId"
          register={register}
          setValue={setValue}
          error={errors.departmentId}
          defaultValue={data?.supervisorId}
        />
      </div>

      {/* Subjects and Classes */}
      <span className="text-xs text-gray-400 font-medium">
        Teaching Information
      </span>
      <div className="flex flex-wrap gap-4">
        <Controller
          name="subjects"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Subjects"
              options={subjects.map((subject: any) => ({
                id: subject.id.toString(),
                label: subject.name,
              }))}
              value={field.value || []}
              onChange={(newValue) => field.onChange(newValue)}
              error={errors.subjects}
            />
          )}
        />
        {/* <Controller
          name="classes"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Classes"
              options={classes.map((cls: any) => ({
                id: cls.id.toString(),
                label: cls.name,
              }))}
              value={field.value || []}
              onChange={(newValue) => field.onChange(newValue)}
              error={errors.classes}
            />
          )}
        /> */}
      </div>

      {/* Qualifications and Specializations */}
      <span className="text-xs text-gray-400 font-medium">
        Qualifications and Specializations
      </span>
      <div className="flex flex-wrap gap-4">
        <Controller
          name="qualifications"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Qualifications"
              options={qualificationsOptions.map((option) => ({
                id: option.id.toString(),
                label: option.label,
              }))}
              value={field.value || []}
              onChange={(newValue) => field.onChange(newValue)}
              error={errors.qualifications}
            />
          )}
        />
        <Controller
          name="specializations"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label="Specializations"
              options={specializationsOptions.map((option) => ({
                id: option.id,
                label: option.label,
              }))}
              value={field.value || []}
              onChange={(newValue) => field.onChange(newValue)}
              error={errors.specializations}
            />
          )}
        />
      </div>

      {/* Profile Image */}
      <div>
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
            alt="Profile Image"
            width={50}
            height={50}
          />
        )}
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
      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md relative"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
          </div>
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
