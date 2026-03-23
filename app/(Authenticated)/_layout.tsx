import IncomingCallModal from "component/incomingcallModal";
import JobAlertScreen from "component/jobs/jobAlertScreen";
import { Stack } from "expo-router";
import { useSocket } from "hooks/useSocket";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { JobLatest } from "types/type";

const getInitialRoute = (role?: string) => {
  switch (role) {
    case 'professional':
      return '(professionalLayout)';
    case 'delivery':
      return '(delivery)';
    default:
      return '(dashboard)';
  }
};

export default function AuthenticatedLayout() {
    const [job, setJob] = useState<JobLatest | null>(null);
    const [showalertModal, setshowalertModal] = useState(false);
    const { socket } = useSocket();
    const role = useSelector((state: RootState) => state.auth.user?.role);
    const initialRoute = getInitialRoute(role);

    useEffect(() => {
        if (!socket) return;

        const handleNewJob = (data: { text: string; data: any }) => {
            console.log('New job received:', data);
            setJob(data.data);
            setshowalertModal(true);
        };

        socket.on('JOB_CREATED', handleNewJob);

        return () => {
            socket.off('JOB_CREATED', handleNewJob);
        };
    }, [socket]);
  
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen  name="(dashboard)" />
        <Stack.Screen name="(profile)" />
        <Stack.Screen name="(wallet)" />
        <Stack.Screen name="(profession)" />
        <Stack.Screen name="(chatcallmessage)" />
        <Stack.Screen name="(professionalLayout)" />
        <Stack.Screen name="(jobs)" />
        <Stack.Screen name="professionals" />
        <Stack.Screen name="professional/[id]" />
        <Stack.Screen name="(notifications)" />
        <Stack.Screen name="(delivery)" />
        <Stack.Screen name="(marketplace)" />
      </Stack>
    {showalertModal &&<JobAlertScreen item={job} showalertModal={showalertModal} setshowalertModal={setshowalertModal}/>}
    <IncomingCallModal />
    </>

 
  );
}
