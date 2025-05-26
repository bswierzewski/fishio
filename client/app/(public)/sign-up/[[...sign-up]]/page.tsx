import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 align-middle">
      <SignUp />
    </div>
  );
}
