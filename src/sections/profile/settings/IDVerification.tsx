import Iconify from "@/components/iconify";

export function IDVerification() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg mx-4" style={{
      background: "radial-gradient(141.2% 102.86% at 8.36% -4.57%, color(display-p3 0.7086 0.9316 0.0953 / 0.53) 0%, color(display-p3 0.0941 0.1137 0.1412 / 0.00) 56.25%), var(--d-color-base-200, color(display-p3 0.0941 0.1137 0.1412))"
    }}>
      <div className={"flex items-center gap-4"}>
        <img src={'/images/profile/id-verification.png'} alt="" />
        <div>
          <h4 className={'font-semibold'}>ID Verification</h4>
          <p className={"text-base-content/80 text-sm"}>
            Verify your identity to unlock additional payment options.
          </p>
        </div>
      </div>
      <button className={"btn btn-primary btn-md"}>Verify</button>
      <div className={"flex items-center gap-4 rounded-lg p-4"} style={{
        background: "color(display-p3 1 0.7451 0 / 0.10)"
      }}>
        <Iconify icon={'custom:warning'} className='w-5 h-5 text-warning' />
        <p className={"text-sm flex-1"}>You’ll be redirected to our trusted verification partner to complete a quick and secure
          KYC process.</p>
      </div>
    </div>
  );
}
