import Advanced from "@/components/settings/advanced";
import General from "@/components/settings/general";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { capitalize } from "@/lib/utils";
import Container from "@/misc/Container";
import { useState } from "react";

function Settings() {
  const settingsTabs = [
    { tab: "general", content: General },
    { tab: "account", content: () => <>Account Tab</> },
    { tab: "advanced", content: Advanced },
  ];
  const [activeTab, setActiveTab] = useState("general");
  return (
    <Container title="Settings">
      <Tabs
        onValueChange={setActiveTab}
        value={activeTab}
        className="flex gap-4 h-full items-start"
      >
        <TabsList className="flex flex-col h-auto gap-2 bg-transparent w-1/5">
          {settingsTabs.map((item) => (
            <TabsTrigger
              value={item.tab}
              className="w-full text-main-100 data-[state=active]:bg-main-100 data-[state=active]:bg-opacity-20 data-[state=active]:text-main-100"
            >
              {capitalize(item.tab)}
            </TabsTrigger>
          ))}
        </TabsList>
        <Separator orientation="vertical" />
        {settingsTabs.map((item) => {
          const Content = item.content;
          return (
            <TabsContent
              value={item.tab}
              className="w-4/5 max-h-[calc(100vh_-_12rem)] overflow-y-auto"
            >
              <Content />
            </TabsContent>
          );
        })}
      </Tabs>
    </Container>
  );
}

export default Settings;
