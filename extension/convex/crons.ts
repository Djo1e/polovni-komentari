import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "post daily engagement question",
  { hourUTC: 8, minuteUTC: 0 },
  internal.engagementQuestions.postDailyQuestion
);

export default crons;
