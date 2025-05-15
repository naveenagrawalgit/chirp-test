import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get)=> ({

    messages:[],
    users: [],
    selectedUser: null,
    isUserLoading:false,
    isMessageLoading: false,

    getUsers: async()=> {
        set({isUserLoading: true})

        try {

            const res= await axiosInstance.get('/messages/users');
            set({users: res.data})

            toast.success("users fetched")
            
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("error inside getusers in chat store")

            
        }
        finally{
            set({isUserLoading:false});
        }
    },

    getMessages: async(userId)=>{

        set({isMessageLoading:true})

        try {
            const res = await axiosInstance(`/messages/${userId}`)

            set({messages: res.data});

            toast.success("messages fetched")
        } catch (error) {

            toast.error(error.response.data.message)
            console.log("error inside getmessages in chat store")
            
        }
        finally{
            set({isMessageLoading: false})
        }
    },

    sendMessages: async(messageData) => {
        const {selectedUser, messages} = get()

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData)
            set({messages: [...messages,res.data]})

            toast.success("message sent")
            
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("error inside send message in useChatstore")
            
        }


    },

    subscribeToMessages: ()=>{
        const {selectedUser} = get()
        if(!selectedUser) return
        const socket = useAuthStore.getState().socket;

        // optimize this later

        socket.on("newMessage", (newMessage)=>{
        const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
        if(!isMessageSentFromSelectedUser) return ;


            set({
                messages: [...get().messages, newMessage],
            });
        })
    },
    unsubscribeToMessages: ()=>{
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage")
    },


    setSelectedUser: async (selectedUser) => set({ selectedUser }),

}))