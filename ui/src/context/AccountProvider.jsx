import React, { useEffect, useState } from "react";
import { createContext } from "react";

export const AccountContext = createContext(null);
const AccountProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [currentChat, setCurrentChat] = useState(null)
    const [updateContactFlag, setUpdateContactFlag] = useState(false);

    useEffect(() => {
        const storedAccount = localStorage.getItem('account');
        if (storedAccount) {
            setAccount(JSON.parse(storedAccount));
        }
    }, []);

    useEffect(() => {
        if (account) {
            localStorage.setItem('account', JSON.stringify(account));
        } else {
            localStorage.removeItem('account');
        }
    }, [account]);

    return (
        <AccountContext.Provider
            value={{
                account,
                setAccount,
                currentChat,
                setCurrentChat,
                updateContactFlag, 
                setUpdateContactFlag
            }}
        >
            {children}
        </AccountContext.Provider>
    );
};

export default AccountProvider;