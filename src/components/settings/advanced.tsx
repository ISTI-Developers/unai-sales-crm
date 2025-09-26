import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { FormEvent, useMemo, useRef, useState } from "react";
import CustomReceipients from "./customReceipients";
import { toast } from "@/hooks/use-toast";
import { useCreateAdvisory, useUNISURLs, useUpdateUNISURL } from "@/hooks/useSettings";

const Advanced = () => {
  return (
    <section className="space-y-4 pb-4">
      <h1 className="font-bold text-lg bg-white">Advanced Settings</h1>
      <div className="space-y-8">
        <SendAdvisory />
        <UNISSource />
      </div>
    </section>
  );
};

const UNISSource = () => {
  const { data, isLoading } = useUNISURLs();
  const { mutate } = useUpdateUNISURL()

  const paths = useMemo(() => {
    if (!data || isLoading) return [];

    return data;
  }, [data, isLoading])

  return <div className="space-y-2">
    <h2 className="font-semibold border-l-4 border-main-500 px-2">
      UNIS Source
    </h2>
    <Separator />
    <p className="text-sm">UNIS url path to be used for APIs and images.</p>
    <RadioGroup onValueChange={(value) => {
      const updatedPaths = paths.map(item => {
        return {
          ...item,
          status: item.path === value ? 1 : 0
        }
      })

      mutate(updatedPaths)
    }}>
      {paths &&
        paths.map(item => {
          return <div key={item.ID} className="flex items-center gap-2">
            <RadioGroupItem id={item.path} value={item.path} checked={Boolean(item.status)} />
            <Label htmlFor={item.path}>{item.path}</Label>
          </div>
        })}
    </RadioGroup>
  </div >
}

const SendAdvisory = () => {
  const [receipient, setReceipient] = useState("all");
  const [receipients, setReceipients] = useState<string[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { mutate } = useCreateAdvisory();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let finalReceipient = receipient;

    if (finalReceipient === "custom") {
      finalReceipient = receipients.join(",");
    }

    const title = titleRef.current?.value;
    const content = contentRef.current?.value;

    if (!title || !content) {
      toast({
        variant: "destructive",
        description: "Please complete the fields.",
      });
      return;
    }

    mutate({ receipient: finalReceipient, title, content });
  };
  return (
    <div>
      <div className="space-y-2">
        <h2 className="font-semibold border-l-4 border-main-500 px-2">
          Send Advisory
        </h2>
        <Separator />
        <p className="text-sm">Send a notification to all or selected users.</p>
      </div>
      <form onSubmit={onSubmit} className="px-4 py-2 space-y-4">
        <div>
          <Label htmlFor="receipients">Receipients</Label>
          <RadioGroup
            onValueChange={(value) => setReceipient(value)}
            className="flex items-center"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom</Label>
              {receipient === "custom" && (
                <CustomReceipients
                  value={receipients}
                  setValue={(value) =>
                    setReceipients((prev) =>
                      prev.includes(value)
                        ? prev.filter((v) => v !== value)
                        : [...prev, value]
                    )
                  }
                />
              )}
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input ref={titleRef} required />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea ref={contentRef} required />
        </div>
        <Button type="submit">
          <p>Send</p>
          <Send />
        </Button>
      </form>
    </div>
  );
};

export default Advanced;
