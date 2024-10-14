import { Suspense } from "react";
import TeacherSchedule from "./TeacherSchedule";

export default async function TeacherPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherPageContent />
    </Suspense>
  );
}

function TeacherPageContent() {
  return <TeacherSchedule />;
}
