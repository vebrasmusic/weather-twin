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
 
const formSchema = z.object({
  cityName: z.string().min(2, { message: "City name is required" }).max(100, { message: "City name must be less than 100 characters" }).regex(/^[A-Za-z]+$/, { message: "City name must contain only letters" })
})

function onSubmit(values: z.infer<typeof formSchema>) {
  console.log(values)
}

export const MainForm = () => {

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
                        Enter your city.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="bg-slate-200 text-slate-950 hover:bg-slate-300">Submit</Button>
            </form>
        </Form>

    )
}