import classNames from 'classnames'
import { FormBox } from "@/components/modal/UserFinanceModal/c/FormBox.tsx";

export const InputBox = ({ type, label, className, ...props }: React.ComponentProps<"input"> & { label: React.ReactNode }) => {
  return (
    <FormBox label={label}>
      <input {...props}
             className={classNames("input bg-base-300 w-full border-0 !outline-0 font-semibold px-4", className)} />
    </FormBox>
  );
};
