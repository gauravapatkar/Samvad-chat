import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { Socket } from "socket.io-client";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [message, setMessage] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessage, setUnseenMessage] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  //fn to get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessage(data.unseenMessage || {});
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //fn to get msg for selected users
  const getMessage = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessage(data.messages || []);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //fn to send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData,
      );
      if (data.success) {
        setMessage((prevMessage) => [...(prevMessage || []), data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //fn to subscribe to message for selected user

  // const subscribeToMessage = async () => {
  //   if (!socket) return;
  //   socket.on("newMessage", (newMessage) => {
  //     if (
  //       selectedUser &&
  //       newMessage.senderId === selectedUser._id
  //     ) {
  //       newMessage.seen = true;
  //       setMessage((prevMessage) => [...(prevMessage || []), newMessage]);
  //       axios.put(`/api/messages/mark/${newMessage._id}`);
  //     } else {
  //       setUnseenMessage((prevUnseenMessage) => ({
  //         ...prevUnseenMessage,
  //         [newMessage.senderId]: prevUnseenMessage[newMessage.senderId]?
  //            prevUnseenMessage[newMessage.senderId] + 1
  //           : 1,
  //       }));
  //     }
  //   });
  // };

  //from chat
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (newMessage) => {
      if (!selectedUser || !authUser) return;
      const myId = authUser._id;
      const isRelevant =
        (newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === myId) ||
        (newMessage.senderId === myId &&
          newMessage.receiverId === selectedUser._id);

      if (isRelevant) {
        setMessage((prev) => [...(prev || []), newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessage((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    };

    socket.on("newMessage", handleMessage);

    return () => {
      socket.off("newMessage", handleMessage);
    };
  }, [socket, selectedUser]);

  //fn to unsubcribe from message
  const unsubcribeFromMessage = () => {
    if (socket) socket.off("newMessage");
  };

  // useEffect(() => {
  //   subscribeToMessage();
  //   return () => unsubcribeFromMessage();
  // }, [socket, selectedUser]);

  const value = {
    message,
    users,
    selectedUser,
    getUsers,
    getMessage,
    sendMessage,
    setSelectedUser,
    setUnseenMessage,
    unseenMessage,
  };
  // console.log("AuthContext inside ChatContext:", useContext(AuthContext));
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
