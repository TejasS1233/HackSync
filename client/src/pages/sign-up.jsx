import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
// import { PromptzerkLogo } from "@/components/logo";
// import SEO from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
      });
      navigate("/login");
    } catch (error) {
      console.error("Failed to create account:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign up with Google:", error);
      setGoogleLoading(false);
    }
  };

  return (
    <>
      {/* <SEO
        description="Create your free Mirage account and start enhancing your AI prompts today."
        title="Sign Up"
      /> */}
      <section className="relative flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
        <form
          className="relative z-10 m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border bg-card p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
          onSubmit={handleSubmit}
        >
          <div className="p-8 pb-6">
            <div>
              <RouterLink aria-label="go home" to="/">
                {/* <PromptzerkLogo /> */}
                <span className="font-bold text-xl">Mirage</span>
              </RouterLink>
              <h1 className="mt-4 mb-1 font-semibold text-xl">
                Create a Mirage Account
              </h1>
              <p className="text-sm">Welcome! Create an account to get started</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                disabled={googleLoading || loading}
                onClick={handleGoogleSignUp}
                type="button"
                variant="outline"
              >
                <svg
                  height="1em"
                  viewBox="0 0 256 262"
                  width="0.98em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Google</title>
                  <path
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    fill="#4285f4"
                  />
                  <path
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    fill="#34a853"
                  />
                  <path
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    fill="#fbbc05"
                  />
                  <path
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    fill="#eb4335"
                  />
                </svg>
                <span>{googleLoading ? "Signing up..." : "Google"}</span>
              </Button>
              <Button
                disabled={loading || googleLoading}
                type="button"
                variant="outline"
              >
                <svg
                  height="1em"
                  viewBox="0 0 256 256"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Microsoft</title>
                  <path d="M121.666 121.666H0V0h121.666z" fill="#f1511b" />
                  <path d="M256 121.666H134.335V0H256z" fill="#80cc28" />
                  <path d="M121.663 256.002H0V134.336h121.663z" fill="#00adef" />
                  <path d="M256 256.002H134.335V134.336H256z" fill="#fbbc09" />
                </svg>
                <span>Microsoft</span>
              </Button>
            </div>

            <hr className="my-4 border-dashed" />

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="block text-sm" htmlFor="firstname">
                    Firstname
                  </Label>
                  <Input
                    disabled={loading || googleLoading}
                    id="firstname"
                    name="firstname"
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    type="text"
                    value={firstName}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="block text-sm" htmlFor="lastname">
                    Lastname
                  </Label>
                  <Input
                    disabled={loading || googleLoading}
                    id="lastname"
                    name="lastname"
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    type="text"
                    value={lastName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block text-sm" htmlFor="email">
                  Email
                </Label>
                <Input
                  disabled={loading || googleLoading}
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm" htmlFor="pwd">
                  Password
                </Label>
                <Input
                  className="input sz-md variant-mixed"
                  disabled={loading || googleLoading}
                  id="pwd"
                  name="pwd"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </div>

              <Button
                className="w-full"
                disabled={loading || googleLoading}
                type="submit"
              >
                {loading ? "Creating account..." : "Continue"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted p-3">
            <p className="text-center text-accent-foreground text-sm">
              Have an account ?
              <Button asChild className="px-2" variant="link">
                <RouterLink to="/login">Sign In</RouterLink>
              </Button>
            </p>
          </div>
        </form>
      </section>
    </>
  );
}
