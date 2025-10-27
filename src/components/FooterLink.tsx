import { Link } from "@tanstack/react-router";

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const FooterLink = ({ to, children, className = "" }: FooterLinkProps) => {
  return (
    <Link to={to} className={`font-normal text-base-content/50 hover:underline hover:text-base-content/70 underline-offset-2 ${className}`}>
      {children}
    </Link>
  );
};
