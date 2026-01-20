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
    "2.1.1": [
      "Fixed an issue where deck images aren't loaded properly when imported to Google Slides.",
      "Added the ideal view link to decks."
    ],
    "2.1.0": [
      "Added Delete functions for saved decks and individual sites."
    ],
    "2.0.1": [
      "Fixed an issue where the 'available' filter is showing bookings beyond 60 days.",
      "Fixed an issue where the sales unit picker of Booking is not opening up."
    ],
    "2.0.0": [
      "Redesigned Sidebar",
      "Sales Deck Revamp and improvements",
      "UI Clean-up for reports page."
    ]
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
