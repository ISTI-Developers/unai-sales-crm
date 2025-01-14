import { useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/providers/users.provider";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { useAuth } from "@/providers/auth.provider";
import useStoredUser from "@/hooks/useStoredUser";
const InitialSetup = () => {
  const { logoutUser } = useAuth();
  const { changePassword } = useUser();
  const { toast } = useToast();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useStoredUser();

  const isReady = useMemo(() => {
    const testPassword = (password: string, regex: RegExp) => {
      return regex.test(password);
    };

    const lengthRegex = /^.{8,}$/;
    const upperRegex = /[A-Z]/;
    const lowerRegex = /[a-z]/;
    const numberRegex = /[\d]/;
    const symbolRegex = /[\W]/;

    const length = testPassword(password, lengthRegex);
    const upperAndLower =
      testPassword(password, upperRegex) && testPassword(password, lowerRegex);
    const number = testPassword(password, numberRegex);
    const symbol = testPassword(password, symbolRegex);

    const match =
      length &&
      upperAndLower &&
      number &&
      symbol &&
      password === confirmPassword;

    return {
      length,
      upperAndLower,
      number,
      symbol,
      match,
    };
  }, [password, confirmPassword]);

  const onSubmit = async () => {
    setLoading((prev) => !prev);

    if (user) {
      const response = await changePassword(user, password);
      console.log(response);
      if (response.acknowledged) {
        toast({
          description: `Your password has been updated. Please login again.`,
          variant: "success",
        });

        const timeout = setTimeout(logoutUser, 1500);

        return () => clearTimeout(timeout);
      }

      if (response.error) {
        toast({
          title: "Auth Error",
          description: `ERROR: ${
            response.error ||
            "Authentication error. Please contact the developer."
          }`,
          variant: "destructive",
        });
        setLoading((prev) => !prev);
      }
    }
  };
  return (
    user && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 w-full h-full backdrop-blur-md flex items-center justify-center backdrop-brightness-90"
      >
        <Helmet>
          <title>Onboarding | Sales Dashboard</title>
        </Helmet>
        <Card>
          <CardHeader className="font-semibold text-lg">
            Welcome to Sales CRM Dashboard!
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              {user.status === "pending" ? (
                <p>
                  Since this is your first time logging in, please update your
                  password to proceed.
                </p>
              ) : (
                <p>
                  Your password has been reset. Please update your password to
                  continue
                </p>
              )}
              <section className="bg-base p-2 rounded-md">
                <p>Your new password must have the following:</p>
                <ul className="text-sm list-disc pl-6">
                  <li
                    className={
                      isReady.length ? "text-green-600" : "text-red-500"
                    }
                  >
                    Minimum of eight (8) characters.
                  </li>
                  <li
                    className={
                      isReady.upperAndLower ? "text-green-600" : "text-red-500"
                    }
                  >
                    One (1) uppercase and one (1) lowercase letter.
                  </li>
                  <li
                    className={
                      isReady.number ? "text-green-600" : "text-red-500"
                    }
                  >
                    One (1) number.
                  </li>
                  <li
                    className={
                      isReady.symbol ? "text-green-600" : "text-red-500"
                    }
                  >
                    One (1) symbol.
                  </li>
                </ul>
              </section>
              <div className="grid grid-cols-[30%_70%] items-center">
                <Label htmlFor="password" className="capitalize">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={cn(
                    "focus-visible:ring-0",
                    confirmPassword.length >= 8 && !isReady.match
                      ? "border-4 border-red-100 bg-red-50 text-red-500 animate-buzz"
                      : isReady.match &&
                          "border-4 border-green-300 text-green-600"
                  )}
                />
              </div>
              <div className="grid grid-cols-[30%_70%] items-center">
                <Label htmlFor="confirmPassword" className="capitalize">
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  className={cn(
                    "focus-visible:ring-0",
                    confirmPassword.length >= 8 && !isReady.match
                      ? "border-4 border-red-100 bg-red-50 text-red-500 animate-buzz"
                      : isReady.match &&
                          "border-4 border-green-300 text-green-600"
                  )}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <AnimatePresence>
                {confirmPassword.length >= 8 && !isReady.match && (
                  <motion.p
                    animate={{ opacity: 1 }}
                    className="p-2 bg-red-50 rounded-md text-red-500"
                  >
                    {Object.values(isReady)
                      .slice(0, -1)
                      .some((check) => !check)
                      ? "Please follow the password format."
                      : "Passwords do not match."}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              onClick={onSubmit}
              variant="ghost"
              disabled={
                Object.values(isReady).some((check) => !check) || loading
              }
              className="w-fit bg-yellow-300 hover:bg-yellow-500 text-white hover:text-white flex gap-4 ml-auto disabled:cursor-not-allowed"
            >
              {loading && <LoaderCircle className="animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    )
  );
};

export default InitialSetup;
