import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import { CHECK_USER_ROUTE, GET_MESSAGES_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Chat from "./Chat/Chat";
import { io } from "socket.io-client";
import { HOST } from "@/utils/ApiRoutes";
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";

function Main() {
  const router =useRouter()
  const [redirectLogin,setRedirectLogin]=useState(false)
  const [{userInfo,currentChatUser,messageSearch,videoCall,voiceCall,incomingVideoCall,incomingVoiceCall},dispatch ]=useStateProvider();
  
  const [socketEvent,setSocketEvent]=useState(false)
  const socket = useRef()
  useEffect(()=>{
if(redirectLogin){
  router.push("/login")
}
  },[redirectLogin])
  onAuthStateChanged(firebaseAuth,async(currentUser)=>{
    if(!currentUser) setRedirectLogin(true);
    if(!userInfo && currentUser?.email){
      const {data}= await axios.post(CHECK_USER_ROUTE,{
        email :currentUser.email,
      })
    
      if(!data.status){
        router.push("/login")
      }
      if(data?.data){
      const {id,name,email,profilePicture:profileImage,status}=data.data
      dispatch({
        type:reducerCases.SET_USER_INFO,
        
       userInfo :{
              id,name,email,profileImage,status
          }}) 

      
    }}
  })
  useEffect(()=>{
    const  getMessages=async() =>{
      const {data:{messages}}=await axios.get(`${GET_MESSAGES_ROUTE}/${userInfo?.id}/${currentChatUser?.id}`);

      dispatch({type : reducerCases.SET_MESSAGES,messages})

    }
    if(currentChatUser?.id){
      getMessages()

    }
  },[currentChatUser])
  useEffect(()=>{
    if(userInfo){
      socket.current=io(HOST);
      socket.current.emit("add-user",userInfo.id)
      dispatch({type : reducerCases.SET_SOCKET,socket})

    }

  },[userInfo]);
  useEffect(()=>{
    if(socket.current && !socketEvent){
      socket.current.on("msg-receive",(data)=>{
        dispatch({
          type : reducerCases.ADD_MESSAGE,newMessage:{
        ...data.message,
          }
        })
      })
      setSocketEvent(true)
    }

  },[socket.current])
  return <>{
    videoCall && <div className="h-screen w-screen max-h-full overflow-hidden">
      <VideoCall/>
    </div>
  }
  {
    voiceCall && <div className="h-screen w-screen max-h-full overflow-hidden">
      <VoiceCall/>
    </div>
  }
  {
    !videoCall && !voiceCall &&(
      
      <div className="grid grid-cols-main w-screen h-screen max-h-screen max-w-full overflow-hidden">
    <ChatList/>

      {currentChatUser?
      <div className={messageSearch ? "grid grid-cols-2 " :"grid-cols-2" }>
        <Chat/>
        {
          messageSearch && <SearchMessages/>
        }
      </div>
      : <Empty/>
      }
   
  </div>
    )
  }
  </>;
  }

export default Main;
