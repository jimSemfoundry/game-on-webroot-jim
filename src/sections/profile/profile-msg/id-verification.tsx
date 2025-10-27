import Iconify from "@/components/iconify";
import { useEffect, useState } from "react";
import { IDVerificationDialog, UploadDocumentDialog } from "./id-verification-dialog";
import { QueryKycDetail } from "@/hooks/api/useAuth";

export function IDVerification() {
  const [open, setOpen] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  const { data } = QueryKycDetail();
  const [isUploadingStatus, setIsUploadingStatus] = useState(false);

  useEffect(() => {
    if (data !== null && data?.document_url !== '') {
      setIsUploadingStatus(true);
    }
  }, [data]);

  return (
    <>
      <div className="rounded-field p-4 max-w-[335px]"
        style={{
          background:
            `radial-gradient(61.78% 115.11% at 6.36% -4.57%, 
          color-mix(in oklch, var(--color-primary), transparent 53%) 0%,
          color-mix(in oklch, var(--color-base-200), transparent 30%) 56.25%)
          color-mix(in oklch, var(--color-base-200), transparent 30%)`,
        }}>

        <div className="flex items-center gap-2 mb-3">
          <img src="/images/profile/id-verification.png" alt="ID Verification" className="w-17 h-17" />

          {
            data?.status === 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm leading-4 sm:text-lg sm:leading-5 font-semibold">ID Verification</h3>
                <p className="text-xs sm:text-sm leading-4.5 text-base-content/50">
                  Verify your identity to unlock additional payment options.
                </p>
              </div>
            )
          }
          {
            data?.status === 1 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm leading-4 sm:text-lg sm:leading-5 font-semibold">Account Verified</h3>
                  <Iconify icon='custom:account-verified' className=' text-primary' />
                </div>
                <p className="text-xs sm:text-sm leading-4.5 text-base-content/50">
                  Your account is now verified and ready for full access.
                </p>
              </div>
            )
          }

        </div>
        {
          data?.status === 0 && (
            <>
              {
                !isUploadingStatus && (
                  <>
                    <button className="btn btn-primary w-full mb-3" onClick={() => {
                      setOpen(true);
                    }}>Verify</button>
                    <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-field">
                      <Iconify icon='custom:warning' className='text-warning w-4 h-4' />
                      <p className="text-xs sm:text-sm leading-4.5 text-base-content flex-1">You’ll be redirected to our trusted verification partner to complete a quick and secure KYC process.</p>
                    </div>
                  </>
                )
              }
              {
                isUploadingStatus && (
                  <button className="btn btn-soft w-full mb-3 " onClick={() => {
                    setOpenUpload(true);
                  }}>Pending Verification</button>
                )
              }
            </>
          )
        }
      </div>

      <IDVerificationDialog open={open} onClose={() => {
        setOpen(false);
      }} />

      <UploadDocumentDialog open={openUpload} onClose={() => {
        setOpenUpload(false);
      }} data={data} />
    </>
  )
}