
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { UserType } from '../types/global.types';



const GlobalDataContext = createContext<{users: UserType[], setUsers: React.Dispatch<React.SetStateAction<UserType[]>>, refreshUsers: () => Promise<void>}>(
  { users: [], setUsers: () => {}, refreshUsers: async () => {} }
);



export default function GlobalDataProvider({ children }: PropsWithChildren<{}>) {
  const [users, setUsers] = useState<UserType[]>([]);

  // Function to fetch users (exposed for manual refresh when needed)
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/users"
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Get users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshUsers = async () => {
    await fetchUsers();
  };

  return (
    <GlobalDataContext.Provider value={{ users, setUsers, refreshUsers }}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  return useContext(GlobalDataContext);
}