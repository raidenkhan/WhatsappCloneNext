import React from "react";

function ChatContainer() {
  return <div className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar">
     <div className="bg-chat-background bg-fixed h-full w-full opacity-5 fixed left-0 z-0"></div>
     <div className="flex w-full">
      <div className="flex flex-col justify-end w-full overflow-auto gap-1">
        
      </div>
     </div>
  </div>;
}

export default ChatContainer;