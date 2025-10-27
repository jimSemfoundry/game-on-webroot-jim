import { Dot } from "lucide-react";

export const RequireItem = ({ label }: { label: React.ReactNode }) => {
  return (
    <div className="flex items-center">
      {label} <Dot className="text-error w-4 h-4" strokeWidth={8} />
    </div>
  );
};
