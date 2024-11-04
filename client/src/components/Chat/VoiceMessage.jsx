import { useStateProvider } from "@/context/StateContext";
import  { useEffect, useRef, useState } from "react";
import Avatar from "../common/Avatar";
import {  FaPlay, FaStop } from "react-icons/fa";
import { calculateTime } from "@/utils/CalculateTime";
import MessageStatus from "../common/MessageStatus";
import WaveSurfer from "wavesurfer.js";
import { HOST } from "@/utils/ApiRoutes";

function VoiceMessage({message}) {

  const [isPlaying, setisPlaying] = useState(false);
  const [{currentChatUser,userInfo}]=useStateProvider();
  const [audioMessage,setAudioMessage]=useState(null);
  const [totalDuration, settotalDuration] = useState(0);
  const [currentPlayBackTime, setcurrentPlayBackTime] = useState(0);
  const waveformRef =useRef(null);
  const waveform=useRef(null);
  
  useEffect(()=>{
    if(audioMessage){
      const updatePlaybackTime=()=>{
        console.log("testing",audioMessage.currentTime)

        setcurrentPlayBackTime(audioMessage .currentTime)
      
      audioMessage.addEventListener("timeupdate",updatePlaybackTime);

    }
    
    return ()=>{
      audioMessage.removeEventListener("timeupdate",updatePlaybackTime);
    }}
  },[audioMessage])

  useEffect(()=>{
    if(waveform.current===null){
    waveform.current=WaveSurfer.create(
      {
        container:waveformRef.current,
        waveColor:"#ccc",
        progressColor : "#4a9eff",
        barWidth:2,
        height:30,
        responsive:true
      }
    )
   
    waveform.current.on("finish",()=>{
      setisPlaying(false)
    })}
return ()=>{
  waveform.current.destroy()
}
  },[]);
useEffect(()=>{
const audioURL= `${HOST}/${message.message}`;
const audio =new Audio(audioURL);
setAudioMessage(audio)
waveform.current.load(audioURL);
waveform.current.on("ready",()=>{
  settotalDuration(waveform.current.getDuration());

})

},[message.message])
  const handlePlayAudio=()=>{
    
    if(audioMessage){
      waveform.current.stop();
      waveform.current.play();
      audioMessage.play();
      setisPlaying(true)
    }}
    const handlePauseAudio =()=>{
      waveform.current.stop();
      audioMessage.pause();
      setisPlaying(false)
  
    };
    const formartTime = time=>{
  
      if(isNaN(time)) return "00:00";
      const minutes =Math.floor(time/60);
      
      const seconds=Math.floor(time%60);
      return `${minutes.toString().padStart(2,"0")} : ${seconds.toString().padStart(2,"0")}`
    
    }
  return <div className={`flex items-center gap-5 text-white px-4  pr-2 py-4 text-sm rounded-md ${message.senderId===currentChatUser.id ?"bg-incoming-background" : "bg-outgoing-background"}`}>
<div>
  <Avatar type={"lg"} image={currentChatUser?.profilePicture}/>

</div>
<div className="cursor-pointer">
  {
    !isPlaying ? <FaPlay onClick={handlePlayAudio}/> : <FaStop onClick={handlePauseAudio}/>
  }
</div>
<div className="relative">
  <div className="w-60" ref={waveformRef}/>
  <div className="text-bubble-meta text-[11px] pt-1 flex justify-between" >
    <span>{formartTime(isPlaying?currentPlayBackTime : totalDuration)}</span>
    <div className="flex gap-1">
      <span>{calculateTime(message.createdAt)}</span>
      {
        message.senderId === userInfo.id && <MessageStatus messageStatus={message.messageStatus}/>
      }
    </div>
  </div>
</div>
  </div>;
}

export default VoiceMessage;
