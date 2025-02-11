import { use_auth } from "@/auth/use_auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link } from "react-router";

type SignUpForm = {
  email: string;
  password: string;
};

type Props = {
  signup: boolean;
};
export const UserAuth: React.FC<Props> = ({ signup }) => {
  const form = useForm<SignUpForm>();
  const { signup_user, signin_user } = use_auth();

  const on_submit: SubmitHandler<SignUpForm> = async (data) => {
    const { email, password } = data;

    if (signup) {
      await signup_user(email, password);
    } else {
      await signin_user(email, password);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="border p-4 flex flex-col gap-2 justify-center">
        <h1 className="text-xl text-center">{signup ? "Sign Up" : "Sign In"}</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(on_submit)} className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input required type="email" placeholder="jane@acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input required type="password" placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">{signup ? "Sign Up" : "Sign In"}</Button>
          </form>
        </Form>
        <Link to={signup ? "/signin" : "/signup"}><p className="text-xs text-center">Go to {signup ? "Sign In" : "Sign Up"}</p></Link> 
      </div>
    </div>
  );
};
