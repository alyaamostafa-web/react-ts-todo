import { useForm, SubmitHandler } from "react-hook-form";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import InputErrorMessage from "../components/ui/InputErrorMessage";
import { REGISTER_FORM } from "../data";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../validation";
import axiosInstance from "../config/axios.config";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import { AxiosError } from "axios";
import { IErrorResponse } from "../interfaces";

interface IFormInput {
  username: string;
  email: string;
  password: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: yupResolver(registerSchema),
  });

  // Handlers

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    console.log(data);

    /**
     * 1 - pending   => LOOADING
     */
    setIsLoading(true);

    try {
      //** 2 - Fulfilled => SUCCESS => (OPTIONAL)

      const { status } = await axiosInstance.post("/auth/local/register", data);

      if (status === 200) {
        toast.success(
          "You will navigate to the login page after 2 seconds to login.",
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

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      // ** 3 - Rejected  => FAILED => (OPTIONAL)
      const errorObj = error as AxiosError<IErrorResponse>;
      // console.log(errorObj.response?.data.error.message);
      toast.error(`${errorObj.response?.data.error.message}`, {
        position: "bottom-center",
        duration: 1500,
      });
    } finally {
      setIsLoading(false);
    }
  };

  //Rnders

  const renderRegisterForm = REGISTER_FORM.map(
    ({ placeholder, name, type, validation }, idx) => {
      return (
        <div key={idx}>
          <Input
            placeholder={placeholder} 
            type={type}
            {...register(name, validation)}
          />


          {errors[name] && <InputErrorMessage msg={errors[name]?.message} />}
        </div>
      );
    }
  );

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center mb-4 text-3xl font-semibold">
        Register to get access!
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {renderRegisterForm}

        <Button isLoading={isLoading} fullWidth>
          {isLoading ? "Looding..." : "Register"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterPage;
