import { experiments } from "@/data/mock";

export function generateStaticParams() {
  return experiments.map((experiment) => ({ id: experiment.id }));
}

export default function ExperimentDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
