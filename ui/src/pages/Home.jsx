import React, { useContext, useEffect, useRef } from "react";
import Contact from "../components/Contact";
import Chat from "../components/Chat";
import Request from "../components/Request";
import { AccountContext } from "../context/AccountProvider";
import { ACTIONS } from "../socket/actions";
import { initSocket } from "../socket/socket";
import { toast } from "react-toastify";

const Home = () => {
    const { account } = useContext(AccountContext);
    const socketRef = useRef(null);
    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on("connect_error", (err) => handleErrors(err));
            socketRef.current.on("connect_failed", (err) => handleErrors(err));
            toast.success("Socket connected!");

            function handleErrors(e) {
                console.log("socket error", e);
                // handle error via toast
                toast.error("Socket connection failed!");
            }
            socketRef.current.emit(ACTIONS.JOIN, account);
        };
        init();
        return () => {
            socketRef.current.disconnect();
        };
    }, []);
    return (
        <section className="h-screen bg-slate-900 flex select-none">
            {/* Contact component - 25% width */}
            <div className="w-1/4 border-r border-gray-700">
                <Contact socketRef={socketRef} />
            </div>

            {/* Chat component - 50% width */}
            <div className="w-2/4">
                <Chat socketRef={socketRef} />
            </div>

            {/* Request component - 25% width */}
            <div className="w-1/4 border-l border-gray-700">
                <Request socketRef={socketRef} />
            </div>
        </section>
    );
};

export default Home;
