"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../input-field";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";
import { StudentSchema, studentSchema, updateStudentSchema} from "@/schemas/student-schema";
import { createStudent, updateStudent } from "@/actions/student-actions";
import SelectField from "../select-field";

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
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(schema),
  });

  const [img, setImg] = useState<any>();
  const router = useRouter();

  

  // const [img, setImg] = useState<any>(data?.img);
  const [state, setState] = useState<ResponseState>({
    success: false,
    error: false,
  });
  const onSubmit = handleSubmit(async (formData) => {
    console.log("Submitting form:", formData);
    let responseState: ResponseState;

    if (type === "create") {
      responseState = await createStudent({
        ...formData,
        img: img?.secure_url || img,
      });
    } else {
      console.log("Updating student", formData);
      responseState = await updateStudent({
        ...formData,
        img: img?.secure_url || img,
      });
    }

    console.log("Response state:", responseState);
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

  const { grades, classes, parents } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
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
      <CldUploadWidget
        uploadPreset="ex-academy"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => (
          <div className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer" onClick={() => open()}>
            <Image src="/upload.png" alt="" width={28} height={28} />
            <span>Upload a photo</span>
          </div>
        )}
      </CldUploadWidget>
      <div className="flex justify-between flex-wrap gap-4">
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

        <SelectField
          label="Parent"
          options={parents.map((parent: any) => ({
            value: parent.id,
            label: `${parent.name} ${parent.surname}`,
          }))}
          name="parentId"
          register={register}
          setValue={setValue}
          error={errors.parentId}
          defaultValue={data?.parentId}
        />

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

        <SelectField
          label="Grade"
          options={grades.map((grade: any) => ({
            value: grade.id,
            label: grade.level.toString(),
          }))}
          name="gradeId"
          register={register}
          setValue={setValue}
          error={errors.gradeId}
          defaultValue={data?.gradeId}
        />

        <SelectField
          label="Class"
          options={classes.map((classItem: any) => ({
            value: classItem.id,
            label: `${classItem.name} - ${classItem._count.students}/${classItem.capacity} Capacity`,
          }))}
          name="classId"
          register={register}
          setValue={setValue}
          error={errors.classId}
          defaultValue={data?.classId}
        />
      </div>

      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;
