import { Card, CardContent, CardHeader } from "@/components/ui/card";
import logo from "@/assets/unmg.png";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth.provider";
import Page from "@/misc/Page";
import PasswordReset from "@/components/home/passwordReset.home";
import Cookies from "js-cookie";

const Login = () => {
  const { toast } = useToast();
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [isEyeVisible, setIsEyeVisible] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const remembermeRef = useRef<HTMLButtonElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

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
    const username = usernameRef.current.value.trim();
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

    const response = await loginUser(username, password);

    if (response !== null && typeof response === "object") {
      setHasSubmitted(false);
      if ("error" in response) {
        toast({
          title: "Login Error",
          description: response.error,
          variant: "destructive",
        });
        usernameRef.current.value = "";
        passwordRef.current.value = "";
        return;
      }
      localStorage.setItem("currentUser", JSON.stringify(response));
      sessionStorage.setItem("loginTime", String(new Date().getTime()));
      localStorage.setItem("saveLogin", String(saveLogin));
      if (response.token) {
        Cookies.set("token", response.token);
      }
      if (localStorage.getItem("last_location") !== null) {
        navigate(String(localStorage.getItem("last_location")));
      } else {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem("currentUser")) {
      navigate("/");
      return;
    }
  }, [navigate]);

  return (
    <Page
      className={classNames(
        "flex items-center justify-center h-screen",
        "bg-[url('assets/unmg.webp')] bg-cover bg-center"
      )}
    >
      <Helmet>
        <title>Sales CRM - Login</title>
      </Helmet>
      <div className="bg-base bg-opacity-90 backdrop-blur-md w-full h-full flex justify-center items-center">
        <Card className="bg-white shadow-lg flex flex-col py-4">
          <CardHeader className="flex flex-col items-center">
            <img src={logo} alt="UNMG Logo" className="w-full max-w-[150px]" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold text-blue-500">
              Sales Dashboard
            </h1>
            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <Input
                type="text"
                placeholder="Email or Username"
                required
                ref={usernameRef}
                className="w-full min-w-[25rem] h-12 focus-visible:ring-0"
              />

              {/* PASSWORD FIELD */}
              <div className="border rounded-md h-12 flex items-center shadow overflow-hidden">
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
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.75 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Eye />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye-off"
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.75 }}
                        transition={{ duration: 0.1 }}
                      >
                        <EyeOff />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>

              {/* EXTRAS SECTION */}
              <section className="flex justify-between items-center">
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
                className="uppercase h-12 bg-black mt-4"
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
