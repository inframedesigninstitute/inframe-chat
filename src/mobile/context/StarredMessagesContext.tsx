import React, { createContext, ReactNode, useContext, useState } from "react";

export interface StarredMessage {
  id: string;
  text: string;
  senderName: string;
  timestamp: Date;
  chatName: string;
  type: "text" | "file" | "image";
}

interface StarredMessagesContextType {
  starredMessages: StarredMessage[];
  addStarredMessage: (message: StarredMessage) => void;
  removeStarredMessage: (id: string) => void;
}

const StarredMessagesContext = createContext<StarredMessagesContextType>({
  starredMessages: [],
  addStarredMessage: () => {},
  removeStarredMessage: () => {},
});

export const StarredMessagesProvider = ({ children }: { children: ReactNode }) => {
  const [starredMessages, setStarredMessages] = useState<StarredMessage[]>([]);

  const addStarredMessage = (message: StarredMessage) => {
    setStarredMessages(prev => [...prev, message]);
  };

  const removeStarredMessage = (id: string) => {
    setStarredMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return (
    <StarredMessagesContext.Provider value={{ starredMessages, addStarredMessage, removeStarredMessage }}>
      {children}
    </StarredMessagesContext.Provider>
  );
};

export const useStarredMessages = () => useContext(StarredMessagesContext);
