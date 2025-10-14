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
    "1.7.5": [
      "Fixed the issue on booking dates"
    ],
    "1.7.4": [
      "New roles management",
      "Added new site maps!",
      "Different views for bookings on the way!"
    ],
    "1.7.3": [
      "Added restrictions for editing clients.",
      "Updated booking cancellation message."
    ],
    "1.7.2": [
      "Added the client name to the brand on booking page."
    ],
    "1.7.1": [
      "Implemented multiple accounts on clients table and individual client information page. Multiple clients for editing is still in progress",
      "Fixed the image issue from Deck Generator and formatted the amounts and site availability.",
      "You can now create reports from the Client Information page"
    ],
    "1.7.0": [
      "Created edit booking form and added booking cancellation reason.",
      "Fixed the view for days vacant."
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
