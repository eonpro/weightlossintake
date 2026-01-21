import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Admin Portal</h1>
          <p className="text-slate-600 mt-2">Sign in to access the dashboard</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl rounded-2xl',
              formButtonPrimary:
                'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl',
              footerActionLink: 'text-emerald-600 hover:text-emerald-700',
              formFieldInput:
                'rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/admin"
        />
      </div>
    </div>
  );
}
