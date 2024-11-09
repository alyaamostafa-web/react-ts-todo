import { useForm, SubmitHandler } from "react-hook-form";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import InputErrorMessage from "../components/ui/InputErrorMessage";
import { LOGIN_FORM } from "../data";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../validation";
import axiosInstance from "../config/axios.config";
import toast from "react-hot-toast";
import { useState } from "react";
import { AxiosError } from "axios";
import { IErrorResponse } from "../interfaces";

interface IFormInput {
  identifier: string;
  password: string;
}

const LoginPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver : yupResolver(loginSchema)
  });

    // Handlers

  const onSubmit: SubmitHandler<IFormInput> = async(data) => {

    setIsLoading(true)

    try {

    

      const {status,data:resData} = await axiosInstance.post('/auth/local',data);

      
      
      if (status === 200) {
        toast.success(
          "You will navigate to the Home page after 2 seconds .",
          {
            position: "bottom-center",
            duration: 1500,
            style: {
              backgroundColor: "black",
              color: "white",
              width: "fit-content",
            },
          }
        );

        localStorage.setItem('loggedInUser',JSON.stringify(resData))

        setTimeout(() => {
          location.replace('/')
        }, 2000);
      }
      
      
    } catch (error) {

      const errorObj = error as AxiosError<IErrorResponse>

      toast.error(
        `${errorObj.response?.data.error.message}` ,
        {
          position: "bottom-center",
          duration: 1500,

        }
      );
      
      
    } finally{
      setIsLoading(false)
    }
    
    
  };

  //Rnders

  const renderLoginForm = LOGIN_FORM.map(({placeholder,name,type,validation},idx)=>{
    return (
      <div key={idx}>
      <Input
        placeholder={placeholder}
        type={type}
        {...register(name, validation)}
      />

      {errors[name] && (
        <InputErrorMessage msg={errors[name]?.message}/>
      )}
    </div>
    )
  }) 



  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center mb-4 text-3xl font-semibold">
        Login to get access!
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
         {renderLoginForm}

        <Button isLoading={isLoading} fullWidth>{isLoading ? "Looding...":"Login"}</Button>
      </form>
    </div>
  );
};

export default LoginPage;
