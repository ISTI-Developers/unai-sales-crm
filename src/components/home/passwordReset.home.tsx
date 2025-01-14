import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/providers/auth.provider";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetData } from "@/interfaces/auth.interface";
import { LoaderCircle } from "lucide-react";
import classNames from "classnames";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

const PasswordReset = () => {
  const { validateEmailAddress, validateCode } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [open, toggleOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<PasswordResetData>({
    ID: 0,
    email_address: "",
  });
  const [otp, setOTP] = useState("");

  const onEmailVerification = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    //CHECK IF THE EMAIL EXISTS THEN IF TRUE, RETRIEVE THE CURRENT USER.

    const response = await validateEmailAddress(emailAddress);
    if (response.ID) {
      toast({
        variant: "success",
        title: "Verification code sent!",
        description:
          "Please check your email address for the verification code.",
      });
      setUser(response);
      setLoading(false);
      setCurrentStep(currentStep + 1);
    } else {
      console.log(response);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "An Error Occured",
        description: response.error ?? "Please contact the IT team.",
      });
    }
  };

  const onCodeVerification = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    //VERIFY CODE AND SEND THE NEW TEMPORARY PASSWORD
    setLoading(true);

    const response = await validateCode(otp, String(user.ID));
    if (response.acknowledged) {
      toast({
        variant: "success",
        title: "Email address verified!",
        description:
          "Please check your email address for your password recovery.",
      });
      setLoading(false);
      setCurrentStep(currentStep + 1);
    } else {
      console.log(response);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "An Error Occured",
        description: response.error ?? "Please contact the IT team.",
      });
    }
  };

  const onOpenChange = (state: boolean) => {
    toggleOpen(state);
    setEmailAddress("");
    setCurrentStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="text-blue-300 hover:underline">
          Forgot Password?
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-hidden pb-1">
          <AnimatePresence mode="wait">
            <motion.div
              className="grid gap-4 px-1"
              key={currentStep}
              initial={{ opacity: 0, x: currentStep === 0 ? 0 : 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 ? (
                <>
                  <DialogDescription>
                    To recover your password, please provide your registered
                    email address below.
                  </DialogDescription>
                  <form className="flex gap-4" onSubmit={onEmailVerification}>
                    <Input
                      type="email"
                      required
                      placeholder="Enter your email address here"
                      value={emailAddress}
                      disabled={loading}
                      onChange={(event) => setEmailAddress(event.target.value)}
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className={classNames("flex gap-4", loading && "pl-2.5")}
                    >
                      {loading && <LoaderCircle className="animate-spin" />}
                      Send
                    </Button>
                  </form>
                </>
              ) : currentStep === 1 ? (
                <>
                  <DialogDescription>
                    Please enter the code sent to{" "}
                    <span className="font-bold">{user.email_address}.</span>
                  </DialogDescription>
                  <form
                    className="flex flex-col items-start gap-4"
                    onSubmit={onCodeVerification}
                  >
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOTP(value)}
                      pattern={REGEXP_ONLY_DIGITS}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <Button
                      type="submit"
                      disabled={loading}
                      className={classNames(
                        "flex gap-4 ml-auto",
                        loading && "pl-2.5"
                      )}
                    >
                      {loading && <LoaderCircle className="animate-spin" />}
                      Verify
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <p>
                    We have sent your new temporary password to your email
                    address. Please update this on your next login.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordReset;
