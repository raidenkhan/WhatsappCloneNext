import React, { useRef, useState,useEffect } from "react";
import {BsEmojiSmile} from 'react-icons/bs'
import {ImAttachment} from 'react-icons/im'
import { MdSend } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import { ADD_IMAGE_MESSAGE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import EmojiPicker from "emoji-picker-react";
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";
const CaptureAudio =dynamic(()=>import( "../common/CaptureAudio"),{
  ssr:false
});
function MessageBar() {
  const [message,setMessage]=useState("");
  const emojiPickerRef=useRef(null)
  const [{userInfo,currentChatUser,socket},dispatch]=useStateProvider()
  const [showEmojiPicker,setShowEmojiPicker]=useState(false);
  const [grabPhoto,setGrabPhoto]=useState(false);
  const [showAudioRecorder,setShowAudioRecorder]=useState(false)
  const handleEmojiModal=()=>{
    setShowEmojiPicker(!showEmojiPicker)
  }
  const handleEmojiClick=(emoji)=>{

setMessage((prevmessage)=>(prevmessage+=emoji.emoji))
  }
  useEffect(() => {
    const handleClickOutside = (event)=>{
   
      if(event.target.id !=="emoji-open"){
      
        if(emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)){
          setShowEmojiPicker(false)
  
        }
      }
    }
  
  document.addEventListener('click',handleClickOutside)
  return ()=>{  
    document.removeEventListener('click',handleClickOutside)
  }
  }, [])
  
  const sendMessage=async()=>{
    try {
      
      const {data}=await axios.post(ADD_MESSAGE_ROUTE,
       {to:currentChatUser?.id,
        from:userInfo.id,
        message
      }
      
      
    )
    socket.current.emit("send-msg",{
      to:currentChatUser?.id,
      from:userInfo.id,
      message:data.message
    })
    dispatch({
      type : reducerCases.ADD_MESSAGE,newMessage :{
        ...data.message
      },
      fromSelf : true
    })
      setMessage("")
    } catch (error) {
      console.log(error)
    }

  }
  const photopickerOnChange=async(e)=>{
    try {
      const file =e.target.files[0];
      const formData=new FormData();
      formData.append("image",file)
      const response= await axios.post(ADD_IMAGE_MESSAGE,formData,{headers:{
        "Content-Type":"multipart/form-data",

      },
      params: {
        from:userInfo.id,
        to : currentChatUser.id

      }}
    )
    
    if(response.status===201){
      socket.current.emit("send-msg",{
        to:currentChatUser?.id,
        from:userInfo.id,
        message:response.data.message
      })
      dispatch({
        type : reducerCases.ADD_MESSAGE,newMessage :{
          ...response.data.message
        },
        fromSelf : true
      })
       
      } 
    }
    catch(error){
      console.log(error)
    }
  }
    
    // const reader=new FileReader();
    // const data=document.createElement('img');
    // reader.onload=function(event){
    //   data.src=event.target.result;
    //   data.setAttribute('data-src',event.target.result)
    // }
    // reader.readAsDataURL(file);
    // setTimeout(() => {
    //   setImage(data.src)
      
    // }, 100);
  
  useEffect(()=>{
    if(grabPhoto){
      const data=document.getElementById('photo-picker');
      data.click();
      document.body.onfocus=(e)=>{
      
        setTimeout(() => {
          setGrabPhoto(false);
        }, 1000);
      }
    }
  },[grabPhoto]);

  return <div className="bg-panel-header-background h-20 px-4 flex items-center relative">
    
      {!showAudioRecorder &&
        <>
      <div className="flex gap-6">
        <BsEmojiSmile className="text-panel-header-icon text-xl cursor-pointer" title="Emoji" id="emoji-open" onClick={handleEmojiModal}/>
        {
          showEmojiPicker && (
          <div className="absolute bottom-24 left-16 z-40" ref={emojiPickerRef}>

            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark"  />
          </div>)
        }
        <ImAttachment className="text-panel-header-icon text-xl cursor-pointer" title="Emoji" onClick={()=>setGrabPhoto(true)}/>
      </div>
      <div className="w-full rounded-lg h-10 flex items-center">
        <input type="text" name="" id=""  placeholder="Type a message" className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4 w-full"
        onChange={e=>setMessage(e.target.value)}
        value={message}/>
      </div>
      <div className="flex w-10 items-center  justify-center">
        
        <button>
        {message.length ?
          (<MdSend className="text-panel-header-icon cursor-pointer text-xl " title="Send Message"
          onClick={sendMessage}/>):
        
        <FaMicrophone className="text-panel-header-icon cursor-pointer text-xl " title="Record"
        onClick={()=>setShowAudioRecorder(true)}/>}
        </button>

        
      </div>
      </>}
      {grabPhoto && <PhotoPicker onChange={photopickerOnChange}/>}
      {showAudioRecorder && <CaptureAudio hide={()=>setShowAudioRecorder(false)}/>}
  </div>;
}

export default MessageBar;
