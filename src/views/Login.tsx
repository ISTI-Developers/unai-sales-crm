import { Card, CardContent, CardHeader } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Page from "@/misc/Page";
import PasswordReset from "@/components/home/passwordReset.home";
import { useLogin } from "@/hooks/useAuth";

const Login = () => {
  const { toast } = useToast();
  const { mutate: login } = useLogin();
  const navigate = useNavigate();

  const [isEyeVisible, setIsEyeVisible] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const remembermeRef = useRef<HTMLButtonElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const eyeAnimation = {
    initial: { opacity: 0, scale: 0.75 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.75 },
    transition: { duration: 0.1 },
  };
  const toggleIcon = () => {
    setIsEyeVisible((prev) => !prev);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setHasSubmitted(true);

    if (!usernameRef.current || !passwordRef.current) {
      toast({
        title: "Login Error",
        description: "Please complete all the fields.",
        variant: "destructive",
      });
      setHasSubmitted(false);
      return;
    }
    let saveLogin: string | null = String(false);
    const username = usernameRef.current.value.trim().toLowerCase();
    const password = passwordRef.current.value.trim();
    if (remembermeRef.current) {
      saveLogin = remembermeRef.current.ariaChecked;
    }

    if (username.length === 0 || password.length === 0) {
      toast({
        title: "Login Error",
        description: "Username or password is empty.",
        variant: "destructive",
      });
      setHasSubmitted(false);
      return;
    }

    login(
      { username: username, password: password },
      {
        onSettled: () => {
          setHasSubmitted(false);
          localStorage.setItem("saveLogin", String(saveLogin));
        },
        onError: () => {
          if (usernameRef.current && passwordRef.current) {
            usernameRef.current.value = "";
            passwordRef.current.value = "";
            return;
          }
        },
      }
    );
  };

  useEffect(() => {
    if (localStorage.getItem("currentUser")) {
      navigate("/");
      return;
    }
  }, []);

  return (
    <Page
      className={cn(
        "flex items-center justify-center h-[100dvh]",
        "bg-[url('assets/unmg.webp')] bg-cover bg-center"
      )}
    >
      <Helmet>
        <title>Sales Platform - Login</title>
      </Helmet>
      <div className="bg-base bg-opacity-90 backdrop-blur-md w-full h-full flex justify-center items-center">
        <Card className="bg-white bg-opacity-50 lg:bg-opacity-100 shadow-lg flex flex-col p-4 px-2 pt-0 rounded-none w-full h-[100dvh] lg:h-auto lg:max-w-md lg:rounded-lg">
          <CardHeader className="flex flex-col items-center pb-0 py-16 lg:pt-6 lg:pb-10">
            <img
              src={logo}
              alt="UNMG Logo"
              className="w-full max-w-[150px] lg:max-w-[125px] -mb-6"
            />
            <h1 className="text-2xl lg:text-xl font-bold text-main-500 text-center">
              UNMG Sales Platform
            </h1>
            <h3>Log in to your account</h3>
            {/* <h3 className="text-xs font-light text-slate-300">Making lives meaningful since 1937 💅</h3> */}
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={onSubmit}>
              <Input
                type="text"
                placeholder="Email or Username"
                required
                ref={usernameRef}
                className="w-full rounded-xl h-12 lg:rounded-md focus-visible:ring-0 shadow-none backdrop-blur"
              />

              {/* PASSWORD FIELD */}
              <div className="border w-full rounded-xl h-12 lg:rounded-md flex items-center overflow-hidden backdrop-blur">
                <Input
                  type={isEyeVisible ? "text" : "password"}
                  placeholder="Password"
                  required
                  ref={passwordRef}
                  className="border-none shadow-none focus-visible:ring-0"
                />
                <Button
                  type="button"
                  className="h-full rounded-none bg-transparent hover:bg-base text-slate-400 hover:text-slate-700"
                  onClick={toggleIcon}
                >
                  <AnimatePresence initial={false} mode="wait">
                    {isEyeVisible ? (
                      <motion.div tabIndex={-1} key="eye" {...eyeAnimation}>
                        <Eye />
                      </motion.div>
                    ) : (
                      <motion.div tabIndex={-1} key="eye-off" {...eyeAnimation}>
                        <EyeOff />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>

              {/* EXTRAS SECTION */}
              <section className="flex justify-between items-center px-1">
                <div className="flex gap-1.5 items-center text-slate-600">
                  <Checkbox id="remember-me" ref={remembermeRef} />
                  <label htmlFor="remember-me" className="text-sm">
                    Remember Me
                  </label>
                </div>
                <PasswordReset />
              </section>
              <Button
                type="submit"
                disabled={hasSubmitted}
                className="uppercase w-full h-12 rounded-xl lg:rounded-md bg-main-700 hover:bg-main-500"
              >
                {hasSubmitted && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

export default Login;
