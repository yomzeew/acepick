import IncomingCallModal from "component/incomingcallModal";
import JobAlertScreen from "component/jobs/jobAlertScreen";
import { CallProvider } from "context/WebRtcContext";
import { Stack } from "expo-router";
import { useSocket } from "hooks/useSocket";
import { useEffect, useState } from "react";
import { JobLatest } from "types/type";


export default function AuthenticatedLayout() {
    const [job,setJob]=useState<JobLatest | null>(null)
      //const { job } = useIncomingJob(5000); // check every 5 seconds
      const [showalertModal,setshowalertModal]=useState(true)
   const { socket } = useSocket();
  
      useEffect(() => {
          if (!socket) return;
      
          const handleNewJob = (data: { text: string; data: any }) => {
              setJob(data.data)
            console.log('New job received:', data);
            
           
          };
      
          socket.on('JOB_CREATED', handleNewJob);
      
          return () => {
            socket.off('JOB_CREATED', handleNewJob);
          };
        }, [socket,job]);
      
  
      useEffect(() => {
          if (job) {
              setshowalertModal(true);
          }
      }, [job]);
  
  return (
    <>
  
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen  name="(dashboard)" />
      <Stack.Screen name="(profile)" />
      <Stack.Screen name="(wallet)" />
      <Stack.Screen name="(profession)" />
      <Stack.Screen name="(chatcallmessage)" />
      <Stack.Screen name="(professionalLayout)" />
      <Stack.Screen name="(jobs)" />
    </Stack>
    {showalertModal &&<JobAlertScreen item={job} showalertModal={showalertModal} setshowalertModal={setshowalertModal}/>}
   
    </>

 
  );
}
