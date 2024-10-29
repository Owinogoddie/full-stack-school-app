"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../input-field";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { StudentSchema, studentSchema, updateStudentSchema } from "@/schemas/student-schema";
import { createStudent, updateStudent } from "@/actions/student-actions";
import SelectField from "../select-field";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import MultiSelect from "../multi-select";
import Switch from "../switch";
import { generateNewAdmNumber } from "@/utils/generate-admission-number";

type ClassItem = {
  id: number;
  name: string;
  gradeId: number;
};

type ResponseState = {
  success: boolean;
  error: boolean;
  message?: string;
  messages?: string[];
};

type AdmissionPattern = {
  prefix: string;
  yearFormat: string;
  digitCount: number;
  separator: string;
  lastNumber: number;
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
    control,
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
      parentId: data?.parentId?.toString(),
      studentCategories: data?.studentCategories || [],
    },
  });

  const [filteredClasses, setFilteredClasses] = useState<ClassItem[]>(relatedData.classes || []);
  const [currentAdmissionNumber, setCurrentAdmissionNumber] = useState<string>(
    data?.admissionNumber || ""
  );
  const router = useRouter();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [img, setImg] = useState<any>(data?.img);
  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });

  const [admissionPattern, setAdmissionPattern] = useState<AdmissionPattern>({
    prefix: "",
    yearFormat: "",
    digitCount: 0,
    separator: "",
    lastNumber: 0,
  });

  const password = watch("password");
  const repeatPassword = watch("repeatPassword");

  useEffect(() => {
    if (relatedData && relatedData.admissionPattern) {
      setAdmissionPattern({
        prefix: relatedData.admissionPattern.prefix,
        yearFormat: relatedData.admissionPattern.yearFormat,
        digitCount: relatedData.admissionPattern.digitCount,
        separator: relatedData.admissionPattern.separator || "",
        lastNumber: relatedData.admissionPattern.lastNumber,
      });
    }
  }, [relatedData]);

  useEffect(() => {
    if (type === "create" && admissionPattern.prefix && admissionPattern.yearFormat && admissionPattern.digitCount) {
      const { admissionNumber } = generateNewAdmNumber({
        prefix: admissionPattern.prefix,
        yearFormat: admissionPattern.yearFormat,
        digitCount: admissionPattern.digitCount,
        separator: admissionPattern.separator,
        lastNumber: admissionPattern.lastNumber,
      });

      console.log('Generated admission number:', admissionNumber);
      setCurrentAdmissionNumber(admissionNumber);
      setValue("admissionNumber", admissionNumber);
    }
  }, [type, admissionPattern, setValue]);

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
      const { admissionNumber } = generateNewAdmNumber({
        prefix: admissionPattern.prefix,
        yearFormat: admissionPattern.yearFormat,
        digitCount: admissionPattern.digitCount,
        separator: admissionPattern.separator || "",
        lastNumber: admissionPattern.lastNumber + 1,
      });

      responseState = await createStudent({
        ...formData,
        img: img?.secure_url || img,
        admissionNumber,
      });

      setAdmissionPattern((prevPattern) => ({
        ...prevPattern,
        lastNumber: prevPattern.lastNumber + 1,
      }));
    } else {
      const convertedData = {
        ...formData,
        id: data?.id || undefined,
        img: img?.secure_url || null,
        schoolId: formData.schoolId || null,
        classId: formData.classId ? Number(formData.classId) : undefined,
        gradeId: formData.gradeId ? Number(formData.gradeId) : undefined,
      };
      responseState = await updateStudent(convertedData);
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

  const { parents, grades, studentCategories } = relatedData;

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (name === 'gradeId' && values.gradeId) {
        const gradeId = Number(values.gradeId);
        const classesForGrade = relatedData.classes.filter(
          (classItem:any) => classItem.gradeId === gradeId
        );
        setFilteredClasses(classesForGrade);

        const currentClassId = values.classId ? Number(values.classId) : null;
        if (currentClassId && !classesForGrade.find((c:any) => c.id === currentClassId)) {
          setValue("classId", undefined);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, relatedData.classes]);
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
            label="User Name"
            name="userName"
            defaultValue={data?.userName}
            register={register}
            error={errors?.userName}
            placeholder="Enter user Name"
            fullWidth
          />
      </div>

          {/* Password Fields Section */}
      {type === "create" ? (
        <div className="flex flex-wrap gap-4 mt-2">
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
            <div className="flex flex-wrap gap-4 mt-2">
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
      <div>
        <span className="text-xs text-gray-400 font-medium">Personal Information</span>
        <div className="flex flex-wrap gap-4 mt-2">
        <InputField
            label="Admission Number"
            name="admissionNumber"
            register={register}
            error={errors?.admissionNumber}
            defaultValue={data?.admissionNumber || currentAdmissionNumber}
            // readOnly
            disabled={type === "update"}
            // className="bg-gray-50" // To indicate it's read-only
          />
        <InputField
            label="UPI"
            name="upi"
            defaultValue={data?.upi}
            register={register}
            error={errors?.upi}
            placeholder="Enter UPI"
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
            label="Address"
            name="address"
            defaultValue={data?.address}
            register={register}
            error={errors.address}
            placeholder="Enter Address"
            fullWidth
          />
        </div>
      </div>

      {/* Parent Information */}
      <div>
        <span className="text-xs text-gray-400 font-medium">Parent Information</span>
        <div className="flex flex-wrap gap-4 mt-2">
          <SelectField
            label="Parent/Guardian"
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
          <SelectField
            label="Grade"
            options={grades.map((grade: any) => ({
              value: grade.id,
              label: grade.levelName,
            }))}
            name="gradeId"
            register={register}
            setValue={setValue}
            error={errors.gradeId}
            defaultValue={data?.gradeId}
          />
         <SelectField
  label="Class"
  options={filteredClasses.map((classItem:any) => ({
    value: classItem.id.toString(),
    label: classItem.name,
  }))}
  name="classId"
  register={register}
  setValue={setValue}
  error={errors.classId}
  defaultValue={data?.classId}
  disabled={!watch("gradeId")}
/>
          <InputField
            label="Enrollment Date"
            name="enrollmentDate"
            type="date"
            defaultValue={data?.enrollmentDate?.toISOString().split("T")[0]}
            register={register}
            error={errors.enrollmentDate}
            fullWidth
          />
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
        <div>
        <span className="text-xs text-gray-400 font-medium">Student Categories</span>
        <div className="flex flex-wrap gap-4">
        <Controller
          name="studentCategories"
          control={control}
          render={({ field }) => (
            <MultiSelect
            label="Student Categories"
            options={studentCategories.map((category: any) => ({
              id: category.id.toString(),
              label: category.name,
            }))}
              value={field.value || []}
              onChange={(newValue) => field.onChange(newValue)}
              error={errors.studentCategories}
            />
          )}
        />
      </div>
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
              alt="Student photo"
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