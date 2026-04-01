import { AppLocale } from "@/lib/i18n/config";

type Messages = {
  sidebar: {
    overview: string;
    aiChat: string;
    studyChat: string;
    planner: string;
    gpa: string;
    timeline: string;
    profile: string;
    support: string;
    settings: string;
    aiAssistant: string;
    activeLearning: string;
    logout: string;
  };
  header: {
    searchPlaceholder: string;
    aiReady: string;
    notifications: string;
    noAlerts: string;
    openProfile: string;
    student: string;
    settings: string;
    profile: string;
    logout: string;
    aiCredits: string;
  };
  landing: {
    features: string;
    solutions: string;
    pricing: string;
    signIn: string;
    getStarted: string;
    badge: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroDescription: string;
    startTrial: string;
    watchDemo: string;
    intelligenceTitle: string;
    intelligenceDescription: string;
    featureAssistantTitle: string;
    featureAssistantDescription: string;
    featurePlanningTitle: string;
    featurePlanningDescription: string;
    featureAnalyticsTitle: string;
    featureAnalyticsDescription: string;
    statAccuracy: string;
    statStudents: string;
    statSupport: string;
    statResponse: string;
    dashboardPreviewAlt: string;
    ctaTitle: string;
    ctaDescription: string;
    getStartedNow: string;
    terms: string;
    privacy: string;
    contact: string;
    footerCopyright: string;
  };
  auth: {
    createAccount: string;
    welcomeBack: string;
    startJourney: string;
    continueJourney: string;
    continueWithEmail: string;
    emailAddress: string;
    password: string;
    forgotPassword: string;
    processing: string;
    signIn: string;
    signUp: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    termsNote: string;
    academicEmailNote: string;
    welcomeTitle: string;
    welcomeDescription: string;
    featureStudyPlans: string;
    featureAnalytics: string;
    featureTutoring: string;
    featureCollaborative: string;
    resetPassword: string;
    resetDescription: string;
    sendResetLink: string;
    sending: string;
    checkYourEmail: string;
    resetEmailSent: string;
    backToSignIn: string;
    updatePassword: string;
    updatePasswordDescription: string;
    newPassword: string;
    confirmNewPassword: string;
    updating: string;
    passwordUpdated: string;
    redirectingDashboard: string;
    verifyEmailDescription: string;
    verifyStep1: string;
    verifyStep2: string;
    verifyStep3: string;
    verifyWaitHint: string;
    goToSignIn: string;
    simpleLoginTitle: string;
  };
  dashboard: {
    welcomeBack: string;
    overviewSubtitle: string;
    startAiSession: string;
    freshnessBadge: string;
    freshnessTitle: string;
    freshnessDescription: string;
    cgpa: string;
    activeCourses: string;
    activeCoursesEmpty: string;
    graduationProgress: string;
    aiStudyAssistant: string;
    viewAll: string;
    askAiPlaceholder: string;
    send: string;
    advisorInsight: string;
    noAdvisorInsights: string;
    recentActivity: string;
    inProgress: string;
  };
  gpa: {
    title: string;
    description: string;
    modelDescription: string;
    student: string;
    semesterProjection: string;
    semesterProjectionDescription: string;
    semester: string;
    addSemester: string;
    currentCgpa: string;
    coursesCount: string;
    credits: string;
    deleteSemester: string;
    selectCourseToAdd: string;
    addTo: string;
    noCoursesAvailable: string;
    noCoursesSelected: string;
    course: string;
    grade: string;
    action: string;
    projectedResults: string;
    activeSemesterGpa: string;
    totalPlannedGpa: string;
    projectedCgpa: string;
    totalPlannedCredits: string;
    gradedCredits: string;
    activeSemesterCredits: string;
    plannedCreditsAcrossSemesters: string;
    targetCgpaCheck: string;
    requiredSemesterGpa: string;
    enterTargetAndCourses: string;
    impossibleTarget: string;
    academicSnapshot: string;
    completedCredits: string;
    requiredCredits: string;
    remainingCredits: string;
    completedCourses: string;
    recentCompletedCourses: string;
    noCompletedCourses: string;
    basedOnCredits: string;
    points: string;
  };
  planner: {
    title: string;
    description: string;
    targetCgpa: string;
    plannedCredits: string;
    yourRequest: string;
    yourRequestPlaceholder: string;
    quickPrompts: string;
    suggestBestCourses: string;
    askPlanner: string;
    asking: string;
    recommendationTitle: string;
    recommendationNote: string;
    eligibleCourses: string;
    unavailableCourses: string;
    selectedCourses: string;
    selectedCredits: string;
    noEligibleCourses: string;
    noUnavailableCourses: string;
    noAnswerYet: string;
    plannerAnswer: string;
    promptUsed: string;
    requiredGpa: string;
    recommendedCredits: string;
  };
  timeline: {
    badge: string;
    title: string;
    description: string;
    student: string;
    degreeProgress: string;
    semesters: string;
    trackedOnPath: string;
    completedCredits: string;
    degreeComplete: string;
    remainingCredits: string;
    totalRequired: string;
    noActivity: string;
    academicYear: string;
    term: string;
    completed: string;
    current: string;
    planned: string;
    failed: string;
    unknown: string;
  };
  profile: {
    personalInfo: string;
    academicSetup: string;
    courseHistory: string;
    completeProfile: string;
    manageProfile: string;
    onboardingDescription: string;
    manageDescription: string;
    finishSetup: string;
    saveChanges: string;
    personalInformation: string;
    personalInformationDescription: string;
    fullName: string;
    department: string;
    university: string;
    selectUniversity: string;
    totalRequiredHours: string;
    academicSetupDescription: string;
    academicHistory: string;
    academicHistoryDescription: string;
    addRow: string;
    semester: string;
    selectSemester: string;
    selectCourse: string;
    status: string;
    completed: string;
    failed: string;
    current: string;
    planned: string;
    noGrade: string;
    noHistory: string;
    back: string;
    continue: string;
    saving: string;
    action: string;
    pleaseCompleteEntry: string;
    duplicateCourse: string;
    duplicateCourseSave: string;
    saveError: string;
    saveSuccess: string;
    loadError: string;
    currentStepError: string;
    step: string;
  };
};

export const messages: Record<AppLocale, Messages> = {
  en: {
    sidebar: {
      overview: "Overview",
      aiChat: "AI Chat",
      studyChat: "Study Chat",
      planner: "Study Planner",
      gpa: "GPA Calculator",
      timeline: "Timeline",
      profile: "Profile",
      support: "Help & Support",
      settings: "Settings",
      aiAssistant: "AI Assistant",
      activeLearning: "Active & Learning",
      logout: "Logout",
    },
    header: {
      searchPlaceholder: "Search courses, notes, or ask AI...",
      aiReady: "AI Ready",
      notifications: "Notifications",
      noAlerts: "No new profile or semester alerts right now.",
      openProfile: "Open academic profile",
      student: "Student",
      settings: "Settings",
      profile: "Profile",
      logout: "Logout",
      aiCredits: "AI Credits",
    },
    landing: {
      features: "Features",
      solutions: "Solutions",
      pricing: "Pricing",
      signIn: "Sign In",
      getStarted: "Get Started",
      badge: "AI-Powered Academic Intelligence",
      heroTitleLine1: "Transform Your",
      heroTitleLine2: "Learning Journey",
      heroDescription: "Experience the future of education with AI-powered analytics, personalized study plans, and intelligent insights.",
      startTrial: "Start Your Free Trial",
      watchDemo: "Watch Demo",
      intelligenceTitle: "Intelligence That Adapts to You",
      intelligenceDescription: "Powered by advanced AI to understand your learning patterns",
      featureAssistantTitle: "AI Study Assistant",
      featureAssistantDescription: "24/7 intelligent support for your academic questions",
      featurePlanningTitle: "Smart Planning",
      featurePlanningDescription: "Personalized study schedules that adapt to your progress",
      featureAnalyticsTitle: "Predictive Analytics",
      featureAnalyticsDescription: "Forecast your academic performance with precision",
      statAccuracy: "Accuracy Rate",
      statStudents: "Active Students",
      statSupport: "AI Support",
      statResponse: "Avg. Response",
      dashboardPreviewAlt: "Dashboard Preview",
      ctaTitle: "Ready to Transform Your Academic Journey?",
      ctaDescription: "Join thousands of students who have already elevated their learning experience",
      getStartedNow: "Get Started Now",
      terms: "Terms",
      privacy: "Privacy",
      contact: "Contact",
      footerCopyright: "© 2024 AetherAcademy. All rights reserved.",
    },
    auth: {
      createAccount: "Create Account",
      welcomeBack: "Welcome Back",
      startJourney: "Start your journey with AI-powered learning",
      continueJourney: "Continue your academic journey",
      continueWithEmail: "or continue with email",
      emailAddress: "Email Address",
      password: "Password",
      forgotPassword: "Forgot password?",
      processing: "Processing...",
      signIn: "Sign In",
      signUp: "Sign Up",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      termsNote: "By continuing, you agree to our Terms of Service and Privacy Policy.",
      academicEmailNote: "Academic email recommended for full features.",
      welcomeTitle: "Welcome to the\nFuture of Learning",
      welcomeDescription: "Experience AI-powered academic intelligence that adapts to your unique learning style.",
      featureStudyPlans: "Personalized study plans powered by AI",
      featureAnalytics: "Real-time academic performance analytics",
      featureTutoring: "24/7 intelligent tutoring assistance",
      featureCollaborative: "Collaborative learning environment",
      resetPassword: "Reset password",
      resetDescription: "Enter your email address and we'll send you a link to reset your password.",
      sendResetLink: "Send reset link",
      sending: "Sending...",
      checkYourEmail: "Check your email",
      resetEmailSent: "We've sent a password reset link to",
      backToSignIn: "Back to sign in",
      updatePassword: "Update password",
      updatePasswordDescription: "Enter your new password below.",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      updating: "Updating...",
      passwordUpdated: "Password updated!",
      redirectingDashboard: "Redirecting to dashboard...",
      verifyEmailDescription: "We sent a verification link so you can activate your account and continue to your dashboard.",
      verifyStep1: "1. Open your inbox.",
      verifyStep2: "2. Click the verification link from the email.",
      verifyStep3: "3. Return here and sign in to continue.",
      verifyWaitHint: "If you hit an email rate limit, wait a few minutes before trying again.",
      goToSignIn: "Go to sign in",
      simpleLoginTitle: "Login",
    },
    dashboard: {
      welcomeBack: "Welcome back",
      overviewSubtitle: "Here's your academic intelligence overview",
      startAiSession: "Start AI Session",
      freshnessBadge: "Profile freshness alerts",
      freshnessTitle: "Keep your academic setup aligned with your current progress",
      freshnessDescription: "These reminders help keep planning, Study Chat, and academic insights accurate.",
      cgpa: "CGPA",
      activeCourses: "Active Courses",
      activeCoursesEmpty: "No active courses",
      graduationProgress: "Graduation Progress",
      aiStudyAssistant: "AI Study Assistant",
      viewAll: "View all",
      askAiPlaceholder: "Ask AI anything about your studies...",
      send: "Send",
      advisorInsight: "AI Advisor Insight",
      noAdvisorInsights: "Advisor insights are not available yet. Your current progress is",
      recentActivity: "Recent Activity",
      inProgress: "In progress",
    },
    gpa: {
      title: "GPA Calculator",
      description: "Model different semester plans, compare grade scenarios, and see how each course affects your cumulative GPA.",
      modelDescription: "Model your semester, project your cumulative GPA, and check what it takes to reach a target.",
      student: "Student",
      semesterProjection: "Semester Projection",
      semesterProjectionDescription: "Build multiple semesters, then project your total GPA plan across all of them.",
      semester: "Semester",
      addSemester: "Add Semester",
      currentCgpa: "Current CGPA",
      coursesCount: "course(s)",
      credits: "credits",
      deleteSemester: "Delete",
      selectCourseToAdd: "Select a course to add",
      addTo: "Add To",
      noCoursesAvailable: "No courses were returned from the courses table yet.",
      noCoursesSelected: "No courses selected for this semester yet.",
      course: "Course",
      grade: "Grade",
      action: "Action",
      projectedResults: "Projected Results",
      activeSemesterGpa: "Active semester GPA",
      totalPlannedGpa: "Total planned GPA",
      projectedCgpa: "Projected CGPA",
      totalPlannedCredits: "Total planned credits",
      gradedCredits: "graded credits",
      activeSemesterCredits: "active semester credits",
      plannedCreditsAcrossSemesters: "planned credits across",
      targetCgpaCheck: "Target CGPA Check",
      requiredSemesterGpa: "Required semester GPA",
      enterTargetAndCourses: "Enter a target and courses",
      impossibleTarget: "This target is above a 4.0 semester GPA with the current planned load.",
      academicSnapshot: "Academic Snapshot",
      completedCredits: "Completed credits",
      requiredCredits: "Required credits",
      remainingCredits: "Remaining credits",
      completedCourses: "Completed courses",
      recentCompletedCourses: "Recent Completed Courses",
      noCompletedCourses: "No completed courses found yet.",
      basedOnCredits: "Based on",
      points: "points",
    },
    planner: {
      title: "Semester Planner",
      description: "Select eligible courses, then get a GPA strategy based on real prerequisites and credit hours.",
      targetCgpa: "Target CGPA",
      plannedCredits: "Planned Credits",
      yourRequest: "Your request",
      yourRequestPlaceholder: "Ask for a realistic GPA strategy, a safer load, or the best combination of courses.",
      quickPrompts: "Quick prompts",
      suggestBestCourses: "Suggest Best Courses",
      askPlanner: "Ask Planner",
      asking: "Thinking...",
      recommendationTitle: "Recommendation",
      recommendationNote: "Recommendation note",
      eligibleCourses: "Eligible Courses",
      unavailableCourses: "Not Yet Eligible",
      selectedCourses: "Selected Courses",
      selectedCredits: "Selected credits",
      noEligibleCourses: "No eligible courses found yet.",
      noUnavailableCourses: "All returned courses are currently eligible.",
      noAnswerYet: "No planner answer yet.",
      plannerAnswer: "Planner Answer",
      promptUsed: "Prompt used",
      requiredGpa: "Required GPA",
      recommendedCredits: "Recommended credits",
    },
    timeline: {
      badge: "Academic Journey",
      title: "Semester Timeline",
      description: "Follow your academic path semester by semester, with course activity and credit progress in one place.",
      student: "Student",
      degreeProgress: "Degree Progress",
      semesters: "Semesters",
      trackedOnPath: "Tracked on your path",
      completedCredits: "Completed Credits",
      degreeComplete: "of degree complete",
      remainingCredits: "Remaining Credits",
      totalRequired: "total required",
      noActivity: "No semester activity found yet.",
      academicYear: "Academic Year",
      term: "Term",
      completed: "Completed",
      current: "Current",
      planned: "Planned",
      failed: "Failed",
      unknown: "Unknown",
    },
    profile: {
      personalInfo: "Personal Info",
      academicSetup: "Academic Setup",
      courseHistory: "Course History",
      completeProfile: "Complete Your Profile",
      manageProfile: "Manage Academic Profile",
      onboardingDescription: "Set up your student profile step by step, then add your academic history from the semester you started studying until now.",
      manageDescription: "Update your personal info, add new semester records, and keep your academic history current whenever a new term starts.",
      finishSetup: "Finish Setup",
      saveChanges: "Save Changes",
      personalInformation: "Personal Information",
      personalInformationDescription: "Keep your name and department updated for a personalized dashboard.",
      fullName: "Full name",
      department: "Department",
      university: "University",
      selectUniversity: "Select a university",
      totalRequiredHours: "Total required hours",
      academicSetupDescription: "Review your university and degree-hour target when your plan changes.",
      academicHistory: "Academic History",
      academicHistoryDescription: "Add new semester records and edit existing rows when a new term starts or your course statuses change.",
      addRow: "Add Row",
      semester: "Semester",
      selectSemester: "Select semester",
      selectCourse: "Select course",
      status: "Status",
      completed: "Completed",
      failed: "Failed",
      current: "Current",
      planned: "Planned",
      noGrade: "No grade",
      noHistory: "No academic history added yet. Use the form above to add rows to the table.",
      back: "Back",
      continue: "Continue",
      saving: "Saving...",
      action: "Action",
      pleaseCompleteEntry: "Please complete the history entry before adding it to the table.",
      duplicateCourse: "This course is already added for the selected semester.",
      duplicateCourseSave: "You have duplicate course entries in the same semester. Please keep only one row per course per semester.",
      saveError: "Failed to save profile.",
      saveSuccess: "Your academic profile has been updated successfully.",
      loadError: "Failed to load profile data.",
      currentStepError: "Please complete the current step before continuing.",
      step: "Step",
    },
  },
  ar: {
    sidebar: {
      overview: "نظرة عامة",
      aiChat: "الدردشة الذكية",
      studyChat: "دردشة الدراسة",
      planner: "مخطط الدراسة",
      gpa: "حاسبة المعدل",
      timeline: "الخط الزمني",
      profile: "الملف الأكاديمي",
      support: "المساعدة والدعم",
      settings: "الإعدادات",
      aiAssistant: "المساعد الذكي",
      activeLearning: "نشط ويتعلم",
      logout: "تسجيل الخروج",
    },
    header: {
      searchPlaceholder: "ابحث عن المقررات أو الملاحظات أو اسأل الذكاء الاصطناعي...",
      aiReady: "الذكاء جاهز",
      notifications: "الإشعارات",
      noAlerts: "لا توجد تنبيهات جديدة للملف أو الفصل حالياً.",
      openProfile: "فتح الملف الأكاديمي",
      student: "طالب",
      settings: "الإعدادات",
      profile: "الملف الشخصي",
      logout: "تسجيل الخروج",
      aiCredits: "رصيد الذكاء",
    },
    landing: {
      features: "المميزات",
      solutions: "الحلول",
      pricing: "الأسعار",
      signIn: "تسجيل الدخول",
      getStarted: "ابدأ الآن",
      badge: "ذكاء أكاديمي مدعوم بالذكاء الاصطناعي",
      heroTitleLine1: "طوّر",
      heroTitleLine2: "رحلتك التعليمية",
      heroDescription: "اختبر مستقبل التعليم من خلال التحليلات الذكية والخطط الدراسية المخصصة والرؤى الأكاديمية المتقدمة.",
      startTrial: "ابدأ تجربتك المجانية",
      watchDemo: "شاهد العرض",
      intelligenceTitle: "ذكاء يتكيف معك",
      intelligenceDescription: "مدعوم بذكاء اصطناعي متقدم لفهم أسلوب تعلمك",
      featureAssistantTitle: "مساعد الدراسة الذكي",
      featureAssistantDescription: "دعم ذكي على مدار الساعة لأسئلتك الأكاديمية",
      featurePlanningTitle: "تخطيط ذكي",
      featurePlanningDescription: "جداول دراسية مخصصة تتكيف مع تقدمك",
      featureAnalyticsTitle: "تحليلات تنبؤية",
      featureAnalyticsDescription: "توقع أدائك الأكاديمي بدقة",
      statAccuracy: "معدل الدقة",
      statStudents: "الطلاب النشطون",
      statSupport: "دعم الذكاء",
      statResponse: "متوسط الاستجابة",
      dashboardPreviewAlt: "معاينة لوحة التحكم",
      ctaTitle: "هل أنت جاهز لتطوير رحلتك الأكاديمية؟",
      ctaDescription: "انضم إلى آلاف الطلاب الذين طوّروا تجربتهم التعليمية بالفعل",
      getStartedNow: "ابدأ الآن",
      terms: "الشروط",
      privacy: "الخصوصية",
      contact: "تواصل معنا",
      footerCopyright: "© 2024 AetherAcademy. جميع الحقوق محفوظة.",
    },
    auth: {
      createAccount: "إنشاء حساب",
      welcomeBack: "مرحباً بعودتك",
      startJourney: "ابدأ رحلتك مع التعلم المدعوم بالذكاء الاصطناعي",
      continueJourney: "أكمل رحلتك الأكاديمية",
      continueWithEmail: "أو المتابعة بالبريد الإلكتروني",
      emailAddress: "البريد الإلكتروني",
      password: "كلمة المرور",
      forgotPassword: "هل نسيت كلمة المرور؟",
      processing: "جارٍ المعالجة...",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      dontHaveAccount: "ليس لديك حساب؟",
      termsNote: "بالمتابعة، فإنك توافق على شروط الخدمة وسياسة الخصوصية.",
      academicEmailNote: "يفضل استخدام بريد أكاديمي للوصول الكامل للمميزات.",
      welcomeTitle: "مرحباً بك في\nمستقبل التعلم",
      welcomeDescription: "اختبر ذكاءً أكاديمياً يتكيف مع أسلوب تعلمك الفريد.",
      featureStudyPlans: "خطط دراسية مخصصة مدعومة بالذكاء الاصطناعي",
      featureAnalytics: "تحليلات فورية للأداء الأكاديمي",
      featureTutoring: "مساعدة تعليمية ذكية على مدار الساعة",
      featureCollaborative: "بيئة تعلم تعاونية",
      resetPassword: "إعادة تعيين كلمة المرور",
      resetDescription: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
      sendResetLink: "إرسال رابط التعيين",
      sending: "جارٍ الإرسال...",
      checkYourEmail: "تحقق من بريدك الإلكتروني",
      resetEmailSent: "لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى",
      backToSignIn: "العودة لتسجيل الدخول",
      updatePassword: "تحديث كلمة المرور",
      updatePasswordDescription: "أدخل كلمة المرور الجديدة أدناه.",
      newPassword: "كلمة المرور الجديدة",
      confirmNewPassword: "تأكيد كلمة المرور الجديدة",
      updating: "جارٍ التحديث...",
      passwordUpdated: "تم تحديث كلمة المرور!",
      redirectingDashboard: "جارٍ التحويل إلى لوحة التحكم...",
      verifyEmailDescription: "أرسلنا رابط تحقق حتى تتمكن من تفعيل حسابك والمتابعة إلى لوحة التحكم.",
      verifyStep1: "1. افتح صندوق الوارد.",
      verifyStep2: "2. اضغط على رابط التحقق في الرسالة.",
      verifyStep3: "3. عد إلى هنا وسجّل الدخول للمتابعة.",
      verifyWaitHint: "إذا وصلت إلى حد الرسائل، انتظر بضع دقائق قبل المحاولة مرة أخرى.",
      goToSignIn: "الذهاب لتسجيل الدخول",
      simpleLoginTitle: "تسجيل الدخول",
    },
    dashboard: {
      welcomeBack: "مرحباً بعودتك",
      overviewSubtitle: "إليك نظرة عامة على وضعك الأكاديمي",
      startAiSession: "ابدأ جلسة ذكية",
      freshnessBadge: "تنبيهات تحديث الملف",
      freshnessTitle: "حافظ على توافق إعداداتك الأكاديمية مع تقدمك الحالي",
      freshnessDescription: "تساعد هذه التذكيرات في إبقاء التخطيط ودردشة الدراسة والرؤى الأكاديمية دقيقة.",
      cgpa: "المعدل التراكمي",
      activeCourses: "المقررات الحالية",
      activeCoursesEmpty: "لا توجد مقررات حالية",
      graduationProgress: "تقدم التخرج",
      aiStudyAssistant: "مساعد الدراسة الذكي",
      viewAll: "عرض الكل",
      askAiPlaceholder: "اسأل الذكاء الاصطناعي أي شيء عن دراستك...",
      send: "إرسال",
      advisorInsight: "رؤية المرشد الذكي",
      noAdvisorInsights: "لا توجد رؤى من المرشد الذكي حالياً. تقدمك الحالي هو",
      recentActivity: "النشاط الأخير",
      inProgress: "قيد التنفيذ",
    },
    gpa: {
      title: "حاسبة المعدل",
      description: "أنشئ عدة خطط فصلية وقارن بين سيناريوهات الدرجات لمعرفة تأثير كل مقرر على معدلك التراكمي.",
      modelDescription: "خطط لفصلك، واحسب معدلك التراكمي المتوقع، واعرف ما المطلوب للوصول إلى الهدف.",
      student: "الطالب",
      semesterProjection: "توقعات الفصول",
      semesterProjectionDescription: "أنشئ عدة فصول ثم احسب تأثيرها على خطة المعدل بالكامل.",
      semester: "الفصل",
      addSemester: "إضافة فصل",
      currentCgpa: "المعدل التراكمي الحالي",
      coursesCount: "مقرر",
      credits: "ساعة",
      deleteSemester: "حذف",
      selectCourseToAdd: "اختر مقرراً لإضافته",
      addTo: "إضافة إلى",
      noCoursesAvailable: "لم يتم تحميل مقررات من جدول المقررات حتى الآن.",
      noCoursesSelected: "لم يتم اختيار أي مقررات لهذا الفصل بعد.",
      course: "المقرر",
      grade: "التقدير",
      action: "إجراء",
      projectedResults: "النتائج المتوقعة",
      activeSemesterGpa: "معدل الفصل الحالي",
      totalPlannedGpa: "معدل الخطة",
      projectedCgpa: "المعدل التراكمي المتوقع",
      totalPlannedCredits: "إجمالي الساعات المخططة",
      gradedCredits: "الساعات المحتسبة",
      activeSemesterCredits: "ساعات الفصل الحالي",
      plannedCreditsAcrossSemesters: "ساعات مخططة عبر",
      targetCgpaCheck: "فحص المعدل المستهدف",
      requiredSemesterGpa: "معدل الفصل المطلوب",
      enterTargetAndCourses: "أدخل المعدل المستهدف والمقررات",
      impossibleTarget: "هذا الهدف يتجاوز معدل فصل 4.0 مع العبء الحالي المخطط.",
      academicSnapshot: "ملخص أكاديمي",
      completedCredits: "الساعات المكتملة",
      requiredCredits: "الساعات المطلوبة",
      remainingCredits: "الساعات المتبقية",
      completedCourses: "المقررات المكتملة",
      recentCompletedCourses: "أحدث المقررات المكتملة",
      noCompletedCourses: "لا توجد مقررات مكتملة بعد.",
      basedOnCredits: "بناءً على",
      points: "نقاط",
    },
    planner: {
      title: "مخطط الفصل",
      description: "اختر المقررات المتاحة ثم احصل على استراتيجية للمعدل اعتماداً على المتطلبات السابقة والساعات الحقيقية.",
      targetCgpa: "المعدل المستهدف",
      plannedCredits: "الساعات المخططة",
      yourRequest: "طلبك",
      yourRequestPlaceholder: "اطلب استراتيجية واقعية لرفع المعدل أو عبئاً أقل أو أفضل توليفة من المقررات.",
      quickPrompts: "طلبات سريعة",
      suggestBestCourses: "اقتراح أفضل المقررات",
      askPlanner: "اسأل المخطط",
      asking: "جارٍ التفكير...",
      recommendationTitle: "التوصية",
      recommendationNote: "ملاحظة التوصية",
      eligibleCourses: "المقررات المتاحة",
      unavailableCourses: "مقررات غير متاحة حالياً",
      selectedCourses: "المقررات المختارة",
      selectedCredits: "الساعات المختارة",
      noEligibleCourses: "لا توجد مقررات متاحة حالياً.",
      noUnavailableCourses: "كل المقررات المعروضة متاحة حالياً.",
      noAnswerYet: "لا توجد إجابة من المخطط بعد.",
      plannerAnswer: "إجابة المخطط",
      promptUsed: "الطلب المستخدم",
      requiredGpa: "المعدل المطلوب",
      recommendedCredits: "الساعات الموصى بها",
    },
    timeline: {
      badge: "الرحلة الأكاديمية",
      title: "الخط الزمني للفصول",
      description: "تابع مسارك الأكاديمي فصلاً بعد فصل مع نشاط المقررات وتقدم الساعات في مكان واحد.",
      student: "الطالب",
      degreeProgress: "تقدم الخطة",
      semesters: "الفصول",
      trackedOnPath: "فصول ضمن مسارك",
      completedCredits: "الساعات المكتملة",
      degreeComplete: "من الخطة مكتمل",
      remainingCredits: "الساعات المتبقية",
      totalRequired: "إجمالي المطلوب",
      noActivity: "لا يوجد نشاط فصلي حتى الآن.",
      academicYear: "العام الأكاديمي",
      term: "الفصل",
      completed: "مكتمل",
      current: "حالي",
      planned: "مخطط",
      failed: "راسب",
      unknown: "غير معروف",
    },
    profile: {
      personalInfo: "البيانات الشخصية",
      academicSetup: "الإعداد الأكاديمي",
      courseHistory: "السجل الدراسي",
      completeProfile: "أكمل ملفك",
      manageProfile: "إدارة الملف الأكاديمي",
      onboardingDescription: "أنشئ ملفك الأكاديمي خطوة بخطوة ثم أضف سجلك الدراسي من أول فصل درست فيه حتى الآن.",
      manageDescription: "حدّث بياناتك الشخصية وأضف سجلات فصلية جديدة وحافظ على سجلك الأكاديمي محدثاً مع كل فصل.",
      finishSetup: "إنهاء الإعداد",
      saveChanges: "حفظ التغييرات",
      personalInformation: "المعلومات الشخصية",
      personalInformationDescription: "حافظ على تحديث اسمك وقسمك للحصول على لوحة أكثر تخصيصاً.",
      fullName: "الاسم الكامل",
      department: "القسم",
      university: "الجامعة",
      selectUniversity: "اختر جامعة",
      totalRequiredHours: "إجمالي الساعات المطلوبة",
      academicSetupDescription: "راجع جامعتك وعدد الساعات المطلوبة عند تغيّر خطتك.",
      academicHistory: "السجل الأكاديمي",
      academicHistoryDescription: "أضف سجلات فصلية جديدة وعدّل السجلات الحالية عندما يبدأ فصل جديد أو تتغير حالة مقرراتك.",
      addRow: "إضافة صف",
      semester: "الفصل",
      selectSemester: "اختر الفصل",
      selectCourse: "اختر المقرر",
      status: "الحالة",
      completed: "مكتمل",
      failed: "راسب",
      current: "حالي",
      planned: "مخطط",
      noGrade: "بدون تقدير",
      noHistory: "لم يتم إضافة سجل أكاديمي بعد. استخدم النموذج أعلاه لإضافة الصفوف.",
      back: "رجوع",
      continue: "متابعة",
      saving: "جارٍ الحفظ...",
      action: "إجراء",
      pleaseCompleteEntry: "يرجى إكمال بيانات السجل قبل إضافته إلى الجدول.",
      duplicateCourse: "تمت إضافة هذا المقرر بالفعل في الفصل المحدد.",
      duplicateCourseSave: "لديك مقررات مكررة في نفس الفصل. يرجى الإبقاء على صف واحد فقط لكل مقرر في كل فصل.",
      saveError: "فشل في حفظ الملف.",
      saveSuccess: "تم تحديث ملفك الأكاديمي بنجاح.",
      loadError: "فشل في تحميل بيانات الملف.",
      currentStepError: "يرجى إكمال الخطوة الحالية قبل المتابعة.",
      step: "الخطوة",
    },
  },
};

export function getMessages(locale: AppLocale) {
  return messages[locale];
}
