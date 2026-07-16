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
          eyebrow="Built for your project workflow"
          title="Everything students need in one organized place"
          description="Each feature connects to your backend and MongoDB account data, so updates remain after refresh and stay private to the signed-in user."
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
