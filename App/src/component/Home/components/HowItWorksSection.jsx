import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { workflowSteps } from "../data/homeData";
import { HOME_ROUTES } from "../routes";
import SectionHeading from "./SectionHeading";
import WorkflowStepCard from "./WorkflowStepCard";

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-white px-5 py-20 dark:bg-slate-950 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Simple workflow"
            title="Start organizing in three steps"
            align="left"
          />

          <Link
            to={HOME_ROUTES.register}
            className="inline-flex items-center gap-2 text-sm font-extrabold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Start now <ArrowRight size={16} />
          </Link>
        </div>

        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-slate-200 md:block dark:bg-slate-800" />
          {workflowSteps.map((step) => (
            <WorkflowStepCard key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
