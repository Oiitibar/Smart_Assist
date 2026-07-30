import { features } from "../data/homeData";
import FeatureCard from "./FeatureCard";
import SectionHeading from "./SectionHeading";

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 bg-slate-50 px-5 py-20 dark:bg-slate-900/55 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Current Smart Assist experience"
          title="Plan, read and revise without switching apps"
          description="The homepage now reflects the functions available in the deployed app: dashboard planning, secure materials, in-app reading, grounded AI, flashcards and saved quizzes."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
