import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/providers/auth.provider";

const Advisory = () => {
  const { advisory, setAdvisory } = useAuth();
  const hasStoredShown = localStorage.getItem("advisory_shown") ?? false;
  const shown = hasStoredShown ? hasStoredShown === "true" : false;
  return (
    <AlertDialog
      open={!!advisory && !shown}
      onOpenChange={(open) => {
        if (!open) {
          setAdvisory(undefined);
          localStorage.setItem("advisory_shown", String(true));
        }
      }}
    >
      <AlertDialogContent aria-describedby={undefined}>
        <AlertDialogHeader>
          <AlertDialogTitle>{advisory?.title}</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="whitespace-break-spaces">{advisory?.content}</div>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Advisory;
