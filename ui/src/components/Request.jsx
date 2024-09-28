import React, { useContext, useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // Icons for accept/dismiss
import { apiRequest } from "../requestMethods";
import { ACTIONS } from "../socket/actions";
import { AccountContext } from "../context/AccountProvider";
import { toast } from "react-toastify";

const Request = ({ socketRef }) => {
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState("Online"); // User status (Online/Offline)
    const [flag, setFlag] = useState(false);
    const { account } = useContext(AccountContext);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.NEW_CHAT_SESSION_REQUEST, (data) => {
                if (data !== null) {
                    setRequests((prev) => [...prev, data]);
                    toast.success("Received new chat request!");
                }
            });

            socketRef.current.on(
                ACTIONS.REMOVE_ACCEPTED_CHAT_SESSION,
                (chatSessionId) => {
                    if (chatSessionId !== null) {
                        setFlag((prev) => !prev);
                        toast.success("Chat request accepted");
                    }
                }
            );
        }

        return () => {
            socketRef.current.off(ACTIONS.NEW_CHAT_SESSION_REQUEST);
            socketRef.current.off(ACTIONS.REMOVE_ACCEPTED_CHAT_SESSION);
        };
    }, [socketRef.current]);

    useEffect(() => {
        const getPendingChatSession = async () => {
            try {
                const { data } = await apiRequest.get("/chat/pending");
                setRequests(data.data);
            } catch (error) {
                console.log(error);
            }
        };
        getPendingChatSession();
    }, [flag]);

    const handleAcceptRequest = (id) => {
        console.log(id);
        socketRef.current.emit(ACTIONS.CHAT_SESSION_ACCEPTED, {
            chatSessionId: id,
            agentId: account.user._id,
        });
    };

    const toggleStatus = async () => {
        const updatedStatus = status === "Online" ? "Offline" : "Online";
        try {
            socketRef.current.emit(ACTIONS.CHANGE_AGENT_STATUS, updatedStatus);
            setStatus(updatedStatus);
            if (updatedStatus === "Offline") {
                setRequests([]);
            } else {
                setFlag((prev) => !prev);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white p-4 scrollbar-thin scrollbar-thumb-rounded">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                {/* Left side: Title and total requests */}
                <div>
                    <h2 className="text-xl font-bold">New Requests</h2>
                    <p className="text-sm text-gray-400">
                        Total Requests: {requests.length}
                    </p>
                </div>

                {/* Right side: Online/Offline status toggle */}
                <div className="flex items-center">
                    <span className="mr-2 text-sm">{status}</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={status === "Online"}
                            onChange={toggleStatus}
                            className="cursor-pointer"
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* Requests Section */}
            {requests.length > 0 ? (
                <div className="flex-grow overflow-y-auto">
                    {requests.map((request) => (
                        <div
                            key={request._id}
                            className="flex justify-between items-center bg-gray-800 p-3 rounded mb-4 hover:bg-gray-700"
                        >
                            {/* Left side: Profile photo, name, and phone */}
                            <div className="flex items-center">
                                <img
                                    src="https://via.placeholder.com/50"
                                    alt={request.customerName}
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                                <div>
                                    <p className="font-bold">
                                        {request.customerName}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {request.customerContact}
                                    </p>
                                </div>
                            </div>

                            {/* Right side: Accept and Dismiss buttons */}
                            <div className="flex items-center">
                                <button
                                    onClick={() =>
                                        handleAcceptRequest(request._id)
                                    }
                                    className="text-green-500 hover:text-green-400"
                                    title="Accept Request"
                                >
                                    <FaCheckCircle size={24} />
                                </button>
                                {/* <button
                onClick={() => handleDismisRequest(request._id)}
                className="text-red-500 hover:text-red-400"
                title="Dismiss Request"
              >
                <FaTimesCircle size={24} />
              </button> */}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-3 text-center">
                    {" "}
                    <p>
                        There are currently no chat requests. Feel free to relax
                        and enjoy until a new request comes in!
                    </p>{" "}
                </div>
            )}
        </div>
    );
};

export default Request;
