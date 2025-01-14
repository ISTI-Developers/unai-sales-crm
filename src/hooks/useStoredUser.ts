import { User } from "@/interfaces/user.interface";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const useStoredUser = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  return { user, setUser };
};

export default useStoredUser;
