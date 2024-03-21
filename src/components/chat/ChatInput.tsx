"use client";

import { useModal } from '@/hooks/useModalStore';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import qs from 'query-string';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import EmojiPicker from '../EmojiPicker';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { Input } from '../ui/input';
import toast from 'react-hot-toast';

const formSchema = z.object({
  content: z.string().min(1)
})

type TFormSchema = z.infer<typeof formSchema>

interface ChatInputProps{
  apiUrl: string,
  query: Record<string, any>, //string -> keys, any -> values
  name: string,
  type: "conversation" | "channel"
}

const ChatInput = ({apiUrl, name, query, type}:ChatInputProps) => {

  const router = useRouter();

  const { onOpen } = useModal();

  const form = useForm<TFormSchema>({
    defaultValues: {
      content:""
    },
    resolver: zodResolver(formSchema)
  })

  const { formState: {isSubmitting}, handleSubmit, control } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });

      await axios.post(url, values);

      form.reset();
      router.refresh();
    } catch (error) {
      toast.error("Could not send the message! Please try again or refresh the page. ");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative p-4 pb-6'>
                  <button
                    type='button'
                    onClick={() => {
                      onOpen("messageFile", {
                        apiUrl, query // query -> channelId and serverId
                      })
                    }}
                    className='absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center'
                  >
                    <Plus className='text-white dark:text-[#313338]'/>
                  </button>
                  <Input
                    disabled={isSubmitting}
                    className='px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200'
                    placeholder={`Message ${type==="conversation" ? name : "#" + name}`}
                    {...field}
                  />
                  <div className='absolute top-7 right-8'>
                    <EmojiPicker
                      onChange={(emoji: string)=>field.onChange(`${field.value}${emoji}`)}
                    />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export default ChatInput