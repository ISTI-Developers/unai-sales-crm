import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { changes } from "./changes";

const Changelog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed bottom-0 right-0 z-[2] hover:bg-transparent"
        >
          {`v${Object.keys(changes)[0]}`}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changelog Details</DialogTitle>
          <DialogDescription>
            This update includes UI improvements and bug fixes for the system.
          </DialogDescription>
        </DialogHeader>
        <div className="text-[0.65rem] pl-4">
          <ol>
            {Object.keys(changes).map((change, index) => {
              return (
                <li key={index} className="list-disc">
                  <p>{change}</p>
                  <ol>
                    {changes[change as keyof typeof changes].map((ch) => (
                      <li key={ch} className="list-disc ml-4">
                        {ch}
                      </li>
                    ))}
                  </ol>
                </li>
              );
            })}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Changelog;
