import Iconify from "@/components/iconify";
import { Card } from "@/sections/profile/c/Card.tsx";
import { toast } from "sonner";
import { usePublicProfileStore } from "@/store/publicProfileSlice.ts";
import { TPublicProfileKeys } from "@/store/type.ts";

const settings: {
  value: TPublicProfileKeys,
  label: string,
  disabled?: boolean
  status?: string
}[] = [
  {
    value: "HideAllProfileInfo",
    label: "Hide All Profile"
  },
  {
    value: "HideStatistics",
    label: "Hide Statistics"
  },
  {
    value: "HideTop3Games",
    label: "Hide Top 3 Games"
  },
  {
    value: "HideAchievements",
    label: "Hide Achievements"
  },
  {
    value: "HideTournamentRewards",
    label: "Hide Tournament Rewards"
  },
  {
    value: "DoNOTReceivePromotionalOffers",
    label: "Do Not Receive Promotional Offers"
  },
  {
    disabled: true,
    value: "DoNotPushNotifications",
    label: "Do Not Push Notifications",
    get status() {
      return Notification.permission === "granted" ? "ON" : "OFF";
    }
  }
];

export function PublicProfile() {
  const { publicProfile, setPublicProfile } = usePublicProfileStore();

  const DoNotPushNotifications = settings.find(s => s.value === "DoNotPushNotifications")!;
  console.info(publicProfile);
  return (
    <Card
      className="md:p-6 md:gap-4 mx-5 md:mx-0 md:max-w-80" title="Public Profile"
      icon={<Iconify icon="custom:public" className="text-primary" />}>
      {settings.map((setting) => {
        if (!setting.disabled) return (
          <div key={setting.value}
               onClick={() => setPublicProfile({ [setting.value]: !publicProfile[setting.value] })}
               className={"bg-base-300 px-4 py-3 text-base-content/50 rounded-lg text-sm"}>
            <div className={"flex items-center w-full justify-between gap-4"}>
              <span className={"flex-1 text-left"}>{setting.label}</span>
              <label className="label">
                {!publicProfile[setting.value] && "OFF"}
                <input type="checkbox" checked={publicProfile[setting.value]} className="toggle toggle-sm toggle-primary" />
                {publicProfile[setting.value] && <span className={"text-primary"}>ON</span>}
              </label>
            </div>
          </div>
        );
      })}

      <div key={DoNotPushNotifications.value}
           onClick={() => {
             toast.info("Please manage notification permissions in your browser settings.");
           }}
           className={"bg-base-300 px-4 py-3 text-base-content/50 rounded-lg text-sm"}>
        <div className={"flex items-center w-full justify-between gap-4"}>
          <span className={"flex-1 text-left"}>{DoNotPushNotifications.label}</span>
          <label className="label">
            {DoNotPushNotifications.status === "OFF" && "OFF"}
            <input
              type="checkbox"
              checked={DoNotPushNotifications.status === "ON"}
              className="toggle toggle-sm toggle-primary" />
            {DoNotPushNotifications.status === "ON" && <span className={"text-primary"}>ON</span>}
          </label>
        </div>
      </div>
    </Card>
  );
}
