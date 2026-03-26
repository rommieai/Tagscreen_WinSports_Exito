import { createContext, useContext, useState } from "react";

const ActiveChatContext = createContext();

export function useActiveComponents() {
  return useContext(ActiveChatContext);
}

export function ActiveComponentsProvider({ children }) {
  const [activeComponents, setActiveComponents] = useState(false);
  const [activeAvatarChat, setActiveAvatarChat] = useState(false);
  const [notificationId, setNotificationId] = useState(false);
  const [openVisaChat, setOpenVisaChat] = useState(false);
  const [isGoal, setIsGoal] = useState(false);
  const [marcador, setMarcador] = useState(0);
  const [hideSubMenu, setHideSubMenu] = useState(true);
  const [finalChat, setFinalChat] = useState(false);
  const [generalNotificationState, setGeneralNotificationState] =
    useState(false);
  const [localAvatars, setLocalAvatars] = useState([]);
  const [avatarOpened, setAvatarOpened] = useState(null);
  const [modelChat, setModelChat] = useState(null);
  const [killChat, setKillChat] = useState(false);
  const [isReconiced, setIsReconiced] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [matchData, setMatchData] = useState(false);

  return (
    <ActiveChatContext.Provider
      value={{
        activeComponents,
        setActiveComponents,
        activeAvatarChat,
        setActiveAvatarChat,
        localAvatars,
        setLocalAvatars,
        notificationId,
        setNotificationId,
        setIsGoal,
        generalNotificationState,
        setGeneralNotificationState,
        openVisaChat,
        setOpenVisaChat,
        isGoal,
        finalChat,
        setFinalChat,
        hideSubMenu,
        setHideSubMenu,
        marcador,
        setMarcador,
        modelChat,
        avatarOpened,
        setAvatarOpened,
        setModelChat,
        killChat,
        setKillChat,
        isReconiced,
        setIsReconiced,
        isStarted,
        setIsStarted,
        matchData,
        setMatchData,
      }}
    >
      {children}
    </ActiveChatContext.Provider>
  );
}
