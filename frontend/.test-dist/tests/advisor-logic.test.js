"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const advisor_1 = require("../src/lib/advisor");
function course(status, creditHours, gradePoints = 0, difficulty = 3, code = "CSE000", name = "Course") {
    return {
        status,
        grade_points: gradePoints,
        courses: {
            credit_hours: creditHours,
            difficulty_level: difficulty,
            code,
            name,
        },
    };
}
function runTest(name, fn) {
    try {
        fn();
        console.log(`PASS ${name}`);
    }
    catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
}
runTest("getMaxAllowedCredits follows CGPA bands", () => {
    strict_1.default.equal((0, advisor_1.getMaxAllowedCredits)(1.9), 12);
    strict_1.default.equal((0, advisor_1.getMaxAllowedCredits)(2.4), 18);
    strict_1.default.equal((0, advisor_1.getMaxAllowedCredits)(3.2), 21);
});
runTest("computeCgpaFromCompletedCourses derives weighted CGPA", () => {
    const result = (0, advisor_1.computeCgpaFromCompletedCourses)([
        course("completed", 3, 4, 2, "CSE101", "Intro"),
        course("completed", 4, 3, 3, "CSE201", "Structures"),
    ]);
    strict_1.default.equal(result, 3.429);
});
runTest("advisor flags overload when upcoming credits exceed CGPA limit", () => {
    const result = (0, advisor_1.buildAdvisorInsights)({
        fullName: "Maya Hassan",
        cgpa: 1.8,
        totalRequiredHours: 142,
        studentCourses: [
            course("completed", 30, 1.8, 2, "GEN100", "Foundation"),
            course("current", 6, 0, 3, "CSE210", "Networks"),
            course("planned", 9, 0, 4, "CSE310", "AI"),
        ],
        riskItems: [],
        latestPlan: null,
    });
    strict_1.default.equal(result.academic.maxAllowedCredits, 12);
    strict_1.default.ok(result.insights.some((item) => item.id === "load-over-limit"));
    strict_1.default.ok(result.insights.some((item) => item.id === "performance-warning"));
});
runTest("advisor highlights heavy difficulty mix even within allowed credits", () => {
    const result = (0, advisor_1.buildAdvisorInsights)({
        fullName: "Sara Adel",
        cgpa: 3.6,
        totalRequiredHours: 142,
        studentCourses: [
            course("completed", 90, 3.6, 2, "GEN200", "Completed"),
            course("current", 3, 0, 4, "CSE401", "Machine Learning"),
            course("planned", 3, 0, 5, "CSE402", "Computer Vision"),
        ],
        riskItems: [],
        latestPlan: null,
    });
    const difficultyInsight = result.insights.find((item) => item.id === "load-difficulty");
    strict_1.default.ok(difficultyInsight);
    strict_1.default.match(difficultyInsight.message, /CSE401/);
    strict_1.default.match(difficultyInsight.message, /CSE402/);
});
runTest("advisor reports graduation completion when no credits remain", () => {
    const result = (0, advisor_1.buildAdvisorInsights)({
        fullName: "Omar Khaled",
        cgpa: 3.8,
        totalRequiredHours: 6,
        studentCourses: [
            course("completed", 3, 4, 2, "CSE101", "Intro"),
            course("completed", 3, 4, 2, "CSE102", "Programming"),
        ],
        riskItems: [],
        latestPlan: null,
    });
    strict_1.default.ok(result.insights.some((item) => item.id === "graduation-ready"));
});
runTest("advisor prefers explicit high-risk analysis when available", () => {
    const result = (0, advisor_1.buildAdvisorInsights)({
        fullName: "Lina Mostafa",
        cgpa: 3.1,
        totalRequiredHours: 142,
        studentCourses: [course("completed", 60, 3.1, 2, "CSE200", "Completed")],
        riskItems: [
            {
                risk_level: "high",
                courses: { code: "CSE450", name: "Deep Learning" },
            },
        ],
        latestPlan: {
            semester_name: "Spring 2026",
            overall_risk: 82,
        },
    });
    const riskInsight = result.insights.find((item) => item.id === "risk-analysis");
    strict_1.default.ok(riskInsight);
    strict_1.default.match(riskInsight.message, /CSE450/);
});
console.log("Advisor logic tests completed successfully.");
