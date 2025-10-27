
export const FormBox = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="text-xs font-semibold text-base-content/50">{label}</div>
      {children}
    </div>
  );
};
