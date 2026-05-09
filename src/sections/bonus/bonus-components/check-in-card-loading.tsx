export const CheckInCardLoading = () => {
  return (
    <div className="gap-3 flex flex-col py-2.5">
      <div className="skeleton h-4 w-20 rounded-lg " />
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex flex-nowrap select-none -mx-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton w-16 h-16 rounded-lg mx-1 flex flex-col items-center justify-between overflow-hidden relative flex-none"></div>
          ))}
        </div>
      </div>
      <div className="skeleton h-10 rounded-lg" />
      <div className="flex items-center justify-between gap-2">
        <div className="skeleton w-[50%] h-10 rounded-lg" />
        <div className="skeleton w-[50%] h-10 rounded-lg" />
      </div>
    </div>
  );
};