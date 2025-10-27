import { m } from "motion/react";
import { useUnreadNotificationCounter } from "@/hooks/api/useAuth.ts";

export default function InternalMessageCounter() {
  const { data: unreadCounter } = useUnreadNotificationCounter()

  return (
    <div className='indicator mr-1 cursor-pointer'>
      <img src="/icons/ui/bell.svg" alt="" className='w-8 h-8 md:w-10 md:h-10' />
      {
        unreadCounter?.count > 0 && (
          <m.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="indicator-item badge badge-primary p-1 z-20 h-3.5 min-w-3.5 text-xs font-bold -bottom-1.5 top-auto left-2.5 md:left-4">
            {unreadCounter?.count >= 10 ? "9+" : unreadCounter?.count}
          </m.span>
        )
      }
    </div>
  );
}
