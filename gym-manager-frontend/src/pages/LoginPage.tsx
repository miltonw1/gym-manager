import LoginForm from '@/components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/50 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <img
          src="/logo.png"
          alt="Logo"
          className="mx-auto h-52 w-auto object-contain"
        />
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
