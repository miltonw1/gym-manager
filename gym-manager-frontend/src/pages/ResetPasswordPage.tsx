import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/50 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
