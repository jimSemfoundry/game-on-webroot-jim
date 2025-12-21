import Iconify from "@/components/iconify";

export function PublicProfile() {

  return (
    <div className="rounded-field bg-base-200 p-3 md:p-6 w-full flex flex-col gap-3 md:gap-4 sm:max-w-[335px]">
      <div className="flex items-center gap-2 md:h-8">
        <Iconify icon='custom:settings' className='text-primary' />
        <h3 className="text-sm font-semibold sm:text-lg text-base-content/80">Public Profile</h3>
      </div>

      <div className="flex gap-4 min-h-12 px-4 py-3 w-full items-center justify-between bg-base-300 rounded-field">
        <h4 className="text-sm sm:text-base text-base-content/50 leading-4.5">Hide all Profile Info</h4>
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/50">
            OFF
          </span>
          <input type="checkbox" className="toggle toggle-primary" />
        </div>
      </div>

      <div className="flex gap-4 min-h-12 px-4 py-3 w-full items-center justify-between bg-base-300 rounded-field"> 
        <h4 className="text-xs sm:text-base text-base-content/50 leading-4.5">Hide Statistics</h4>
        <div className="flex items-center gap-2">
          <input type="checkbox" className="toggle toggle-primary" />
          <span className="text-sm text-base-content/50">
            ON
          </span>
        </div>
      </div>

      <div className="flex gap-4 min-h-12 px-4 py-3 w-full items-center justify-between bg-base-300 rounded-field">
        <h4 className="text-xs sm:text-base text-base-content/50 leading-4.5">Hide Top 3 Games</h4> 
        <div className="flex items-center gap-2">
          <input type="checkbox" className="toggle toggle-primary" />
          <span className="text-sm text-base-content/50">
            ON
          </span>
        </div>
      </div>

      <div className="flex gap-4 min-h-12 px-4 py-3 w-full items-center justify-between bg-base-300 rounded-field">
        <h4 className="text-xs sm:text-base text-base-content/50 leading-4.5">Hide Achievements</h4>
        <div className="flex items-center gap-2">
          <input type="checkbox" className="toggle toggle-primary" />
          <span className="text-sm text-base-content/50">
            ON
          </span>
        </div>
      </div>

      <div className="flex gap-4 min-h-12 px-4 py-3 w-full items-center justify-between bg-base-300 rounded-field">
        <h4 className="text-xs sm:text-base text-base-content/50 leading-4.5">Hide Tournament Rewards</h4>
        <div className="flex items-center gap-2">
          <input type="checkbox" className="toggle toggle-primary" />
          <span className="text-sm text-base-content/50">
            ON
          </span>
        </div>
      </div>
      
      <div className="flex gap-4 min-h-12 px-4 py-3 w-full items-center justify-between bg-base-300 rounded-field">
        <h4 className="text-xs sm:text-base text-base-content/50 leading-4.5">Do NOT receive promotional offers</h4>
        <div className="flex items-center gap-2">
          <input type="checkbox" className="toggle toggle-primary" />
          <span className="text-sm text-base-content/50">
            ON
          </span>
        </div>
      </div>

      <div className="flex gap-4 min-h-12 px-4 py-3 w-full items-center justify-between bg-base-300 rounded-field">
        <h4 className="text-xs sm:text-base text-base-content/50 leading-4.5">Do NOT Push Notifications</h4>
        <div className="flex items-center gap-2">
          <input type="checkbox" className="toggle toggle-primary" />
          <span className="text-sm text-base-content/50">
            ON
          </span>
        </div>
      </div>
    </div>
  )
}