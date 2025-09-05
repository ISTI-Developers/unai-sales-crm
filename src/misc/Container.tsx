import { ReactNode, lazy, Suspense } from "react";
import Page from "./Page";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar.provider";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const PageTitle = lazy(() => import("@/misc/PageTitle"));

interface ContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
}
const Container = ({ children, title = "", className }: ContainerProps) => {
  const { setOpen, isHandheld, isCollapsed } = useSidebar();
  return (
    <div
      className={cn(
        "flex flex-col lg:gap-4 text-black mainArea",
        isCollapsed ? "collapsed" : ""
      )}
    >
      <header className="bg-red-500 w-full  lg:rounded-b-lg flex items-center justify-between p-2 px-4 text-white sticky top-0 lg:relative z-[2]">
        {isHandheld && (
          <Button
            variant="ghost"
            onClick={() => setOpen(true)}
            className="px-2 hover:bg-red-900"
          >
            <Menu />
          </Button>
        )}
        <Suspense fallback={<>Loading...</>}>
          <PageTitle title={title} />
        </Suspense>
        {/* <Uservatar /> */}
      </header>
      <Page
        className={cn(
          "bg-white shadow-md lg:rounded-lg p-4 flex flex-col h-[calc(100dvh_-_3.25rem)] lg:h-full lg:min-h-0 gap-4 overflow-y-auto",
          className
        )}
      >
        {children}
      </Page>
    </div>
  );
};

// const UserAvatar = () => {
//   const { user } = useAuth();

//   const [initials, setInitials] = useState<string>("");

//   useEffect(() => {
//     if (user) {
//       if (user.first_name && user.last_name) {
//         setInitials(
//           user.first_name.substring(0, 1) + user.last_name.substring(0, 1)
//         );
//       }
//     }
//   }, [user]);

//   return (
//     <Avatar>
//       <AvatarImage src={user?.image} />
//       <AvatarFallback className="bg-blue-500 uppercase">
//         {initials}
//       </AvatarFallback>
//     </Avatar>
//   );
// };
export default Container;
