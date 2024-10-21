export const  menuItems = [
    {
      title: "MENU",
      items: [
        {
          icon: "/home.png",
          label: "Home",
          href: "/",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/calendar.png",
          label: "Academic Years",
          href: "/list/academic-year",
          visible: ["admin"],
        },
        {
          icon: "/calendar.png",
          label: "Terms",
          href: "/list/terms",
          visible: ["admin"],
        },
        {
          icon: "/subject.png",
          label: "Departments",
          href: "/list/departments",
          visible: ["admin"],
        },
        {
          icon: "/message.png",
          label: "Fees",
          href: "/fees",
          visible: ["admin"],
        },
        {
          icon: "/class.png",
          label: "Grades",
          href: "/list/grades",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/class.png",
          label: "Classes",
          href: "/list/classes",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/student.png",
          label: "Student Categories",
          href: "/list/student-categories",
          visible: ["admin", "teacher"],
        },
        
        {
          icon: "/teacher.png",
          label: "Teachers",
          href: "/list/teachers",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/parent.png",
          label: "Parents",
          href: "/list/parents",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/student.png",
          label: "Students",
          href: "/list/students",
          visible: ["admin", "teacher"],
        },
       
        {
          icon: "/subject.png",
          label: "Subjects",
          href: "/list/subjects",
          visible: ["admin"],
        },
        {
          icon: "/subject.png",
          label: "Specialized programmes",
          href: "/list/special-programmes",
          visible: ["admin"],
        },
        {
          icon: "/attendance.png",
          label: "Attendance",
          href: "/list/attendance",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/lesson.png",
          label: "Lessons",
          href: "/list/lessons",
          visible: ["admin", "teacher"],
        },
        {
          icon: "/exam.png",
          label: "Grade Scale",
          href: "/list/grade-scale",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/exam.png",
          label: "Exams Schedules",
          href: "/list/exam-schedule",
          visible: ["admin", "teacher", "student", "parent"],
        },
       
        {
          icon: "/exam.png",
          label: "Exams",
          href: "/list/exams",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/assignment.png",
          label: "Assignments",
          href: "/list/assignments",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/result.png",
          label: "Results",
          href: "/list/results",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/result.png",
          label: "Results Filter",
          href: "/list/results/results/filter",
          visible: ["admin", "teacher",],
        },
        {
          icon: "/result.png",
          label: "Ranking",
          href: "/list/results/results/ranking",
          visible: ["admin", "teacher",],
        },
        {
          icon: "/result.png",
          label: "Promotions",
          href: "/list/promotions",
          visible: ["admin", "teacher",],
        },
        
        {
          icon: "/calendar.png",
          label: "Events",
          href: "/list/events",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/message.png",
          label: "Messages",
          href: "/list/messages",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/announcement.png",
          label: "Announcements",
          href: "/list/announcements",
          visible: ["admin", "teacher", "student", "parent"],
        },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          icon: "/profile.png",
          label: "Profile",
          href: "/profile",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/setting.png",
          label: "Settings",
          href: "/settings",
          visible: ["admin", "teacher", "student", "parent"],
        },
        {
          icon: "/logout.png",
          label: "Logout",
          href: "/logout",
          visible: ["admin", "teacher", "student", "parent"],
        },
      ],
    },
  ];