import { ReactNode, lazy, Suspense } from "react";
import Page from "./Page";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import Notifications from "./Notifications";

const PageTitle = lazy(() => import("@/misc/PageTitle"));

interface ContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
}
const Container = ({ children, title = "", className }: ContainerProps) => {
  const { pathname } = useLocation();
  return (
    <div
      className={cn(
        "flex flex-col lg:gap-4 text-black"
      )}
    >
      <header className="bg-red-500 w-full lg:rounded-b-lg flex items-center justify-between p-2 text-white sticky top-0 lg:relative z-[2]">

        <Suspense fallback={<>Loading...</>}>
          <PageTitle title={title} />
        </Suspense>
        <Notifications />
      </header>
      <Page
        className={cn(
          "bg-white shadow-md lg:rounded-lg p-4 flex flex-col w-full h-full lg:min-h-0 gap-4 overflow-y-auto",
          pathname.split("/").length > 2 ? "max-h-[calc(100dvh_-_5.75rem)]" : "max-h-[calc(100dvh_-_3.25rem)]",
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
