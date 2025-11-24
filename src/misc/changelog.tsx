import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Changelog = () => {
  const changes = {
    "1.8.4": [
      "Added image loaders.",
      "Updated the logic of retrieving site images."
    ],
    "1.8.3": [
      "Removed redundancies on site availability.",
      "Fixed an issue where booking monthly rates is always 0",
    ],
    "1.8.2": [
      "fix client name on reports page.",
      "fix the restriction of remarks and price accesses.",
      "adjust of layout of dashboard for ops account.",
      "added activate/ deactivate / dismantle functions for sites.",
      "added filter of site owner on sites.",
    ],
    "1.8.1": [
      "Fixed the display of contract adjustments",
      "Changed the behavior of booking dates based on selected booking status.",
      ""
    ],
    "1.8": [
      "New design for dashboard.",
      "Setup the role access of OPS.",
      "Add and Edit of Sites.",
      "Added a display for current week in Reports page."
    ],
  };
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
            This update includes UI improvements and bug fixes for the clients
            table.
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
