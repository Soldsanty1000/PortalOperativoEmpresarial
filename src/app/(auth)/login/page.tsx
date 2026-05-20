import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Portal Operativo</h1>
          <p className="text-sm text-muted-foreground mt-1">Acceso privado a la red</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
