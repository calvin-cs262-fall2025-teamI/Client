
import { UserType } from '../types/global.types';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';



const GlobalDataContext = createContext<{users: UserType[], setUsers: React.Dispatch<React.SetStateAction<UserType[]>>}>({ users: [], setUsers: () => {}    });


export default function GlobalDataProvider({ children }: PropsWithChildren<{}>) {
  const [users, setUsers] = useState<UserType[]>([]);
    // Get Users from API
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await fetch("https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/users");
          const data = await response.json();
          setUsers(data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
  
      fetchUsers();
    }, []);

    return (
        <GlobalDataContext.Provider value={{ users, setUsers }} >
            {children}
        </GlobalDataContext.Provider>

    )

}

export function useGlobalData() {
  return useContext(GlobalDataContext);
}