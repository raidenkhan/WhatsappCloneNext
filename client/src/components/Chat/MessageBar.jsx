import React, { useState } from "react";
import {BsEmojiSmile} from 'react-icons/bs'
import {ImAttachment} from 'react-icons/im'
import { MdSend } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import { ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
function MessageBar() {
  const [message,setMessage]=useState("");
  const [{userInfo,currentChatUser},dispatch]=useStateProvider()
  const sendMessage=async()=>{
    try {
      console.log(message)
      const {data}=await axios.post(ADD_MESSAGE_ROUTE,
       {to:currentChatUser?.id,
        from:userInfo.id,
        message
      }


      )
      setMessage("")
    } catch (error) {
      console.log(error)
    }

  }
  return <div className="bg-panel-header-background h-20 px-4 flex items-center relative">
      <>
      <div className="flex gap-6">
        <BsEmojiSmile className="text-panel-header-icon text-xl" title="Emoji"/>
        <ImAttachment className="text-panel-header-icon text-xl" title="Emoji"/>
      </div>
      <div className="w-full rounded-lg h-10 flex items-center">
        <input type="text" name="" id=""  placeholder="Type a message" className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full"
        onChange={e=>setMessage(e.target.value)}
        value={message}/>
      </div>
      <div className="flex w-10 items-center  justify-center">
        <button>
          <MdSend className="text-panel-header-icon cursor-pointer text-xl " title="Send Message"
          onClick={sendMessage}/>
        {/* <FaMicrophone className="text-panel-header-icon cursor-pointer text-xl " title="Record"/> */}
        </button>
      </div>
      </>
  </div>;
}

export default MessageBar;
