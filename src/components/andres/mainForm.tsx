import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const apiUrl = process.env.NEXT_PUBLIC_API_URL
 
const formSchema = z.object({
  cityName: z.string().min(2, { message: "Address is required" }).max(100, { message: "City name must be less than 100 characters" }).regex(/^[A-Za-z\s,',]+$/, { message: "City name must contain only letters, spaces, commas, and apostrophes" })
})


type MainFormProps = {
    onSubmit: (data: any) => void; // Adjust the type based on your actual onSubmit function
  };

export const MainForm = ({onSubmit}: MainFormProps) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          cityName: "",
        },
      })

    return (

        <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                name="cityName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                        <Input placeholder="San Diego" {...field} className="text-slate-200" />
                    </FormControl>
                    <FormDescription>
                        {"Enter a U.S. city (make sure you spell it correctly...)"}
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="bg-slate-300 text-slate-950 hover:bg-slate-300">Submit</Button>
            </form>
        </Form>
    )
}