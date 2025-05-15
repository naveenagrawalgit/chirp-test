import {create} from "zustand"
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =import.meta.env.MODE === 'development'? 'http://localhost:5001' : '/';

export const useAuthStore = create((set,get) => ({

    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers:[],
    socket:null,

    checkAuth: async() => {
        try {

            const res = await axiosInstance.get("/auth/check");

            console.log(res.data," data from check in back")

            set({ authUser: res.data })
            get().connectSocket()


            // console.log(authUser," authUser inside try block")

        } catch (error) {
            console.log("error in front checkauth  :",error)
            
            set({authUser: null})
        }
        finally{
            set({isCheckingAuth: false})
        }
    },

    SignUp : async(data)=>{
        // GETTING data from signup page

        set({isSigningUp: true})
        try {

            // sending 'data' to backend
            const res = await axiosInstance.post("/auth/signup", data)
            set({authUser: res.data})
            get().connectSocket()


            toast.success("Account created successfully")

            
        } catch (error) {
            toast.error(error.response.data.message)
            console.log("error during storing data in backend")
        }
        finally{

           set( {isSigningUp: false})
        }

    },

    login: async(data)=>{
        set({isLoggingIn: true})

        try {

            const res = await axiosInstance.post("/auth/login",data)

            set({authUser: res.data})
            toast.success("Account login successfull")

            get().connectSocket()

            console.log("res log in front inside login", res)

        } catch (error) {
            toast.error(error.response.data.message)
            console.log("error during login")
            
        }
        finally{
            set({isLoggingIn: false})
        }


    },

    logout: async ()=> {

        try {
            const res = await axiosInstance.post("/auth/logout")
            console.log("console log in logout inside useAuthStore",res)
            set({authUser: null})
            get().disconnectSocket()
            toast.success("logged out successfully")
        } catch (error) {
            console.log(error.response.data.message)
            
        }
    },

    updateProfile : async(data) => {

        set({isUpdatingProfile: true})

        try {
            const res = await axiosInstance.put("/auth/update-profile", data);

            set({authUser: res.data})
            toast.success("profile updated successfully")

        } catch (error) {
            console.log('error inside upadte profile in useauthstore frontend',error)
            toast.error(error.response.data.message)

        }
        finally{
            set({isUpdatingProfile: false})
        }

    },

    connectSocket: ()=>{

        const{authUser} = get()

        if(!authUser || get().socket?.connected) return
        
        const socket = io(BASE_URL,{
            query:{
                userId: authUser._id,
            },
        });
        socket.connect()
        set({socket:socket})

        socket.on("getOnlineUsers",(userIds)=>{
            set({onlineUsers: userIds})
        })
    },
    disconnectSocket: ()=>{
        if(get().socket?.connected) get().socket.disconnect();
    },


}))

