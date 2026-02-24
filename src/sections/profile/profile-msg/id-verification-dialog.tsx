import { authService } from '@/services/authService';
import { Modal } from '@/components/ui/Modal';
import { QueryKycDetail } from '@/hooks/api/useAuth';
import clsx from 'clsx';
import { useState, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Iconify from '@/components/iconify';
import { formatDateTime } from '@/utils/formatDateTime';

interface StepItemProps {
  step: number;
  current: { step: number; label: string; des?: string }[];
}

const Step = ({ step, current }: StepItemProps) => (
  <ol>
    {current.map((item) => (
      <li key={item.step} className="flex items-start">
        <div className="flex flex-col items-center justify-start">
          <div
            className={clsx(
              'flex h-4.5 w-4.5 items-center justify-center rounded-full text-xs leading-4.5',
              step >= item.step ? 'bg-primary text-primary-content' : 'text-primary bg-primary/10',
            )}
          >
            {step >= item.step ? '✓' : item.step}
          </div>
          {item.step < current.length && (
            <div className={clsx('h-10 w-1', step >= item.step ? 'bg-primary' : 'bg-primary/10')} />
          )}
        </div>
        <div className='ml-2.5 flex flex-col gap-1'>
          <h3 className="text-sm leading-4 font-semibold">{item.label}</h3>
          <div className="text-xs leading-4 text-base-content/50">
            {item?.des}
          </div>
        </div>
      </li>
    ))}
  </ol>
);

export const UploadDocumentDialog = ({ open, onClose, data }: { open: boolean; onClose: () => void, data: any }) => {
  const [step] = useState(1);
  //   const navigate = useNavigate();
  const { t } = useTranslation();
  const steps = [
    { step: 1, label: t('common.submitted'), des: `Last Update: ${formatDateTime(data?.created_at * 1000)}` },
    { step: 2, label: t('common.pendingVerification'), des: `This process may take up to 72 hours.Update at ${formatDateTime(data?.updated_at * 1000)}` },
    { step: 3, label: t('common.verificationCompleted') },
  ];
  return (
    <Modal
      position='modal-middle'
      title={
        <span className="flex items-center gap-2 text-base font-semibold leading-8">
          <Iconify icon="custom:user" className="text-primary" />
          ID Verification
        </span>
      }
      isOpen={open}
      onClose={onClose}
      zIndex={80}
      className="!max-w-[335px] bg-base-400"
    >
      <div className="flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-col gap-2 bg-base-300 rounded-lg p-4">
          <div className='flex items-center justify-between font-bold text-xs leading-3 text-base-content/50'>
            <div>Status</div>
            <div>Pending Verification</div>
          </div>
          <div className='flex items-center justify-between font-bold text-xs leading-3 text-base-content/50'>
            <div>{t("transaction:common.createdOn", "Created On")}</div>
            <div>{formatDateTime(data?.created_at * 1000)}</div>
          </div>
        </div>
        <div className="pb-3" >
          {/* <p className="mb-2 text-sm leading-6">{t('common.documentUploadedSuccessfullyDescription')}</p> */}
          <div className="px-2">
            <Step step={step} current={steps} />
          </div>
        </div>
        <button
          className="btn btn-primary h-12 w-full"
          onClick={() => {
            onClose();
            // navigate(-1);
          }}
        >
          {t('common:common.close')}
        </button>
      </div>
    </Modal>
  );
};

export function IDVerificationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [openUpload, setOpenUpload] = useState(false);
  const [selected, setSelected] = useState<number>(0);
  const [fileName, setFileName] = useState('');
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [isUploading, setIsUploading] = useState('');
  const [isUploadingUrl, setIsUploadingUrl] = useState('');
  const { t } = useTranslation();

  const DocumentTypeOptions: { id: number; label: string }[] = [
    { id: 0, label: t('common.idCard') },
    { id: 1, label: t('common.passport') },
    { id: 2, label: t('common.driverLicense') },
    { id: 3, label: t('common.etc') },
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (validTypes.includes(file.type)) {
      setFileName(file.name);
      // Create a temporary URL for the uploaded file
      const fileUrl = URL.createObjectURL(file);
      setIsUploading(fileUrl);

      const formData = new FormData();
      formData.append('file', file);

      authService.uploadPrivateImage(formData).then((res) => {
        if (res.code === 0) {
          setIsUploadingUrl(res.data.file_path);
        } else {
          toast.error((t('toast:uploadFailed')));
        }
      });
    }
  };

  const [loading, setLoading] = useState(false);

  const { data } = QueryKycDetail();

  const submit = () => {
    if (isUploadingUrl === '') {
      return;
    }
    setLoading(true);
    authService.updateKyc({
      document_url: isUploadingUrl,
      document_type: selected,
    })
      .then((res) => {
        console.log(res);
        if (res.code === 0) {
          setOpenUpload(true);
          //   refetch();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal isOpen={open} onClose={onClose} className='bg-base-400' title={
      <span className="flex items-center gap-2 text-base font-semibold leading-8">
        <Iconify icon="custom:user" className="text-primary" />
        ID Verification
      </span>
    }>
      <div className="bg-base-300 flex flex-col gap-3 rounded-lg px-3 py-4">
        <p className="text-sm leading-5 text-base-content/50">{t('common.uploadDocumentDescription')}</p>

        {!showUploadDocument ? (
          <div className="flex flex-col gap-6">
            {DocumentTypeOptions.map(({ id, label }) => (
              <div key={id} className="flex items-center justify-between px-4">
                <span className="text-lg leading-7">{label}</span>
                <input
                  type="radio"
                  name={`radio-${id}`}
                  className={clsx('radio radio-md ml-auto border', selected === id ? 'radio-primary' : '')}
                  checked={selected === id}
                  onChange={() => setSelected(id)}
                />
              </div>
            ))}
            <button className="btn btn-primary h-12" onClick={() => setShowUploadDocument(true)}>
              {t('common.continue')}
            </button>
          </div>
        ) : (
          <div>
            <label htmlFor="fileinp">
              <div className="border-base overflow-hiddena mb-3 flex h-43 flex-col items-center justify-center gap-6 rounded-lg border">
                {isUploading === '' ? (
                  <>
                    <svg
                      width="41"
                      height="40"
                      viewBox="0 0 41 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16.0738 5.11854C17.5393 5.03985 19.0151 5 20.5 5C21.9849 5 23.4607 5.03985 24.9262 5.11854C26.5389 5.20514 27.9757 6.09353 28.8136 7.4364L30.1823 9.62976C30.5808 10.2683 31.2574 10.7022 32.0325 10.8123C32.6748 10.9036 33.3147 11.0024 33.9521 11.1086C36.3386 11.5063 38 13.5964 38 15.9567V30C38 32.7614 35.7614 35 33 35H8C5.23858 35 3 32.7614 3 30V15.9567C3 13.5964 4.66143 11.5063 7.04786 11.1086C7.68526 11.0024 8.32516 10.9036 8.96747 10.8123C9.7426 10.7022 10.4192 10.2683 10.8177 9.62975L12.1864 7.4364C13.0243 6.09353 14.4611 5.20514 16.0738 5.11854ZM20.5 7.5C19.0598 7.5 17.6288 7.53865 16.2079 7.61495C15.4409 7.65613 14.7309 8.08102 14.3073 8.7599L12.9386 10.9532C12.1335 12.2435 10.795 13.0777 9.31921 13.2875C8.69668 13.3759 8.07651 13.4717 7.45878 13.5746C6.33563 13.7618 5.5 14.759 5.5 15.9567V30C5.5 31.3807 6.61929 32.5 8 32.5H33C34.3807 32.5 35.5 31.3807 35.5 30V15.9567C35.5 14.759 34.6644 13.7618 33.5412 13.5746C32.9235 13.4717 32.3033 13.3759 31.6808 13.2875C30.205 13.0778 28.8665 12.2435 28.0614 10.9533L26.6927 8.7599C26.2691 8.08102 25.5591 7.65613 24.7921 7.61495C23.3712 7.53865 21.9402 7.5 20.5 7.5ZM20.5 15C17.0482 15 14.25 17.7982 14.25 21.25C14.25 24.7018 17.0482 27.5 20.5 27.5C23.9518 27.5 26.75 24.7018 26.75 21.25C26.75 17.7982 23.9518 15 20.5 15ZM11.75 21.25C11.75 16.4175 15.6675 12.5 20.5 12.5C25.3325 12.5 29.25 16.4175 29.25 21.25C29.25 26.0825 25.3325 30 20.5 30C15.6675 30 11.75 26.0825 11.75 21.25ZM30.5 17.5C30.5 16.8096 31.0596 16.25 31.75 16.25H31.7625C32.4529 16.25 33.0125 16.8096 33.0125 17.5V17.5125C33.0125 18.2029 32.4529 18.7625 31.7625 18.7625H31.75C31.0596 18.7625 30.5 18.2029 30.5 17.5125V17.5Z"
                        fill="#A6ADBB"
                        style={{ fill: '#A6ADBB', fillOpacity: 1 }}
                      />
                    </svg>
                    <p className="text-lg leading-7">{t('common.tapToOpenCamera')}</p>
                  </>
                ) : (
                  <img src={`${isUploading}`} className="h-full w-full rounded-lg" />
                )}
              </div>
              <div className="file-input file-input-accent border-primary h-12 w-full overflow-hidden border pr-4 bg-base-300">
                <div className="bg-primary border-primary text-primary-content flex h-full items-center justify-center border px-4">
                  {t('common.selectFile')}
                </div>
                <div className="scrollbar-hide flex h-full flex-1 items-center overflow-x-auto pl-4 whitespace-nowrap">
                  <span className="text-sm">{fileName || ''}</span>
                </div>
              </div>

              <input
                type="file"
                id="fileinp"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />
              <p className="px-1 text-xs leading-8">{t('common.acceptedFormats', { size: 5 })}</p>
            </label>
            <button
              className={clsx('btn mt-6 h-12 w-full', isUploading === '' || loading ? '' : 'btn-primary')}
              disabled={isUploading === '' || loading}
              onClick={submit}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm text-primary" />
              ) : (
                t('common.continue')
              )}
            </button>
          </div>
        )}
      </div>
      <UploadDocumentDialog
        open={openUpload}
        data={data}
        onClose={() => {
          setOpenUpload(false);
        }}
      />
    </Modal>
  );
}
