import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/50 p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
