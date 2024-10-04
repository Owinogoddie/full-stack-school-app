"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { StudentSchema, studentSchema, updateStudentSchema } from "@/schemas/student-schema";
import { createStudent, updateStudent } from "@/actions/student-actions";
import SelectField from "../select-field";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

const StudentForm = ({
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
  const schema = type === "create" ? studentSchema : updateStudentSchema;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<StudentSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      dateOfBirth: data?.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0] : undefined,
      enrollmentDate: data?.enrollmentDate ? new Date(data.enrollmentDate).toISOString().split("T")[0] : undefined,
      classId: data?.classId?.toString(),
      gradeId: data?.gradeId?.toString(),
      academicYearId: data?.academicYearId?.toString(),
    },
  });

  const router = useRouter();

  const [img, setImg] = useState<any>(data?.img);
  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const password = watch("password");
  const repeatPassword = watch("repeatPassword");
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
    }
  }, [errors]);

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
    if (type === "create" && formData.password !== formData.repeatPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    let responseState: ResponseState;
    if (type === "create") {
      responseState = await createStudent({
        ...formData,
        img: img?.secure_url || img,
      });
    } else {
      const convertedData = {
        ...formData,
        id: data?.id || undefined,  // Use undefined if id is not provided
        img: img?.secure_url || null,
        schoolId: formData.schoolId || null,  // Use null if schoolId is not provided
        classId: formData.classId ? Number(formData.classId) : undefined,
        gradeId: formData.gradeId ? Number(formData.gradeId) : undefined,
      };
      responseState = await updateStudent({
        ...formData,
        ...convertedData,
        img: img?.secure_url || null,
      });
    }

    setState(responseState);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Student has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      state.messages?.forEach((message: string) => toast.error(message));
    }
  }, [state, router, type, setOpen]);

  const { parents } = relatedData;
  console.log(data)

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>

      {/* Authentication Information */}
      <div>
        <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
        <div className="flex flex-wrap gap-4 mt-2">
          <InputField
            label="UPI"
            name="upi"
            defaultValue={data?.upi}
            register={register}
            error={errors?.upi}
            placeholder="Enter UPI"
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
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <span className="text-xs text-gray-400 font-medium">Personal Information</span>
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
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            defaultValue={data?.dateOfBirth?.toISOString().split("T")[0]}
            register={register}
            error={errors.dateOfBirth}
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
          <InputField
            label="National ID"
            name="nationalId"
            defaultValue={data?.nationalId}
            register={register}
            error={errors.nationalId}
            placeholder="Enter National ID"
          />
          <InputField
            label="Address"
            name="address"
            defaultValue={data?.address}
            register={register}
            error={errors.address}
            placeholder="Enter Address"
          />
        </div>
      </div>

      {/* Parent Information */}
      <div>
        <span className="text-xs text-gray-400 font-medium">Parent Information</span>
        <div className="flex flex-wrap gap-4 mt-2">
          <InputField
            label="Parent Name"
            name="parentName"
            defaultValue={data?.parentName}
            register={register}
            error={errors.parentName}
            placeholder="Enter Parent Name"
          />
          <InputField
            label="Parent Contact"
            name="parentContact"
            defaultValue={data?.parentContact}
            register={register}
            error={errors.parentContact}
            placeholder="Enter Parent Contact"
          />
          <InputField
            label="Parent Email"
            name="parentEmail"
            defaultValue={data?.parentEmail}
            register={register}
            error={errors.parentEmail}
            placeholder="Enter Parent Email"
          />
          <SelectField
            label="Parent"
            options={parents.map((parent: any) => ({
              value: parent.id,
              label: `${parent.firstName} ${parent.lastName}`,
            }))}
            name="parentId"
            register={register}
            setValue={setValue}
            error={errors.parentId}
            defaultValue={data?.parentId}
          />
        </div>
      </div>

      {/* Academic Information */}
      <div>
        <span className="text-xs text-gray-400 font-medium">Academic Information</span>
        <div className="flex flex-wrap gap-4 mt-2">
          <InputField
            label="Admission Number"
            name="admissionNumber"
            defaultValue={data?.admissionNumber}
            register={register}
            error={errors?.admissionNumber}
            placeholder="Enter Admission Number"
          />
          <SelectField
          label="Grade"
          options={relatedData?.grades?.map((grade:any) => ({
            value: grade.id,
            label: grade.levelName,
          }))} // Mapping related data for grades
          name="gradeId"
          register={register}
          setValue={setValue}
          error={errors.gradeId}
          defaultValue={data?.gradeId}
        />
          <SelectField
          label="Class"
          options={relatedData.classes.map((grade:any) => ({
            value: grade.id,
            label: grade.name,
          }))} // Mapping related data for grades
          name="classId"
          register={register}
          setValue={setValue}
          error={errors.classId}
          defaultValue={data?.classId}
        />
         {
          type==='create' && (
            <SelectField
            label="Academic Year"
            options={relatedData.academicYears.map((year:any) => ({
              value: year.id,
              label: year.year,
            }))}
            name="academicYearId"
            register={register}
            setValue={setValue}
            error={errors.academicYearId}
            defaultValue={data?.academicYearId}
          />
          )
         }

          {/* <SelectField
            label="Class"
            options={classes.map((classItem: any) => ({
              value: classItem.id,
              label: classItem.name,
            }))}
            name="classId"
            register={register}
            setValue={setValue}
            error={errors.classId}
            defaultValue={data?.classId}
          /> */}
          
          <InputField
            label="Enrollment Date"
            name="enrollmentDate"
            type="date"
            defaultValue={data?.enrollmentDate?.toISOString().split("T")[0]}
            register={register}
            error={errors.enrollmentDate}
          />
          {/* <InputField
            label="id"
            name="id"
            type="hidden"
            defaultValue={data?.id}
            register={register}
            error={errors.id}
          /> */}
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <span className="text-xs text-gray-400 font-medium">Additional Information</span>
        <div className="flex flex-wrap gap-4 mt-2">
          <InputField
            label="Medical Info"
            name="medicalInfo"
            defaultValue={data?.medicalInfo}
            register={register}
            error={errors.medicalInfo}
            placeholder="Enter Medical Info"
          />
          <InputField
            label="Special Needs"
            name="specialNeeds"
            defaultValue={data?.specialNeeds}
            register={register}
            error={errors.specialNeeds}
            placeholder="Enter Special Needs"
          />
        </div>
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

export default StudentForm;