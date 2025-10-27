import { useAuth } from "@/contexts/AuthContext.tsx";
import { Card } from "@/sections/profile/c/Card.tsx";
import Iconify from "@/components/iconify";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

export function Settings() {
  const { logout } = useAuth();

  const navigate = useNavigate();

  return (
    <Card
      icon={<Iconify icon="custom:setting" className="text-primary" />}
      title="Settings"
    >
      <button className="btn btn-soft btn-primary w-full btn-md" onClick={() => {
        void logout();
        void navigate({ to: "/casino", search: { openLogin: undefined, redirect: undefined } });
      }}>Logout<LogOut className='w-4 h-4' />
      </button>
    </Card>
  );
}
