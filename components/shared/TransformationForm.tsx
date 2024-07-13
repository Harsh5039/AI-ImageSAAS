"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
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
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { useEffect, useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import { Value } from "@radix-ui/react-select"
import { updateCredits } from "@/lib/actions/user.actions"
import MediaUploader from "./MediaUploader"
import TransformedImage from "./TransformedImage"
import { getCldImageUrl } from "next-cloudinary"
import { addImage, updateImage } from "@/lib/actions/image.action"
import { useRouter } from "next/navigation"
import { InsufficientCreditsModal } from "./InsufficientCreditsModal"


 export const formSchema = z.object({
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  promt: z.string().optional(),
  publidId: z.string(),
})

 const TransformationForm = ({action,data=null,userId,type,creditBalance,config=null}:
    TransformationFormProps) => {

      const transformationType = transformationTypes[type];
      const [image,setImage] = useState(data)
      const [newTransformation,setNewTransformation] = useState<Transformations | null>(null);
      const [isSubmitting, SetIsSubmitting] = useState(false);
      const [isTransforming, SetIsTransforming] = useState(false);
      const [transformationConfig, setTransformationConfig] = useState(config);
      const [isPending,startTransition] = useTransition()
      const router = useRouter()


   const initialValues = data && action === 'Update'?{
    title: data?.title,
    aspectRatio: data?.aspectRatio,
    color: data?.color,
    promt: data?.promt,
    publidId: data?.publidId,
   } : defaultValues

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues:initialValues,
      })
     
      // 2. Define a submit handler.
       async function onSubmit(values: z.infer<typeof formSchema>) {
        SetIsSubmitting(true);
        if(data || image){
          const  transformationUrl = getCldImageUrl({
            width: image?.width,
            height: image?.height,
            src: image?.publicId,
            ...transformationConfig
          })

          const imageData ={
            title:values.title,
            publicId:image?.publicId,
            transformationType:type,
            width :image?.width,
            height :image?.height,
            config :transformationConfig,
            secureURL:image?.secureURL,
            transformationURL:transformationUrl,
            aspectRatio: values.aspectRatio,
            prompt: values.promt,
            color: values.color,
          }

          if(action === 'Add'){
            try{
              const newImage = await addImage({
                image:imageData,
                userId,
                path:'/'
              })
              if(newImage){
                form.reset()
                setImage(data)
                router.push(`/transformation/${newImage._id}`);

              }
            }catch(error){
              console.log(error);
            }
          }

          else if(action === 'Update'){
            try{
              const UpdatedImage = await updateImage({
                image:{
                  ...imageData,
                  _id:image._id
                },
                userId,
                path:`/transformations/${data._id}`
              })
              if(UpdatedImage){
  
                router.push(`/transformations/${UpdatedImage._id}`);

              }
            }catch(error){
              console.log(error);
            }
          }
        }
        SetIsSubmitting(false) 
      }

      const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
        const imageSize = aspectRatioOptions[value as AspectRatioKey];
        setImage((prevState: any) => ({
          ...prevState,
          aspectRatio: imageSize.aspectRatio,
          width: imageSize.width,
          height: imageSize.height,
        }));
        setNewTransformation(transformationType.config);
        return onChangeField(value);
      };
      

      const onInputChangehandler =(fieldName :string,value:string, type:string,
         onChangeField:(value :string) => void) =>{
            debounce(() => {
              setNewTransformation((prevState: any) => ({
                ...prevState,
                [type]:{
                  ...prevState?.[type],
                  [fieldName === 'prompt' ?'promt' :'to']:
                  value
                }
              }))
            }, 1000)();
              return onChangeField(value)
          
          }

      const onTransformHandler =() =>{
        SetIsTransforming(true)

        setTransformationConfig(
          deepMergeObjects(newTransformation,
            transformationConfig)
        )
        setNewTransformation(null)

        startTransition(async() =>{
            await updateCredits(userId,creditFee)
        })
      }
      
      useEffect(() =>{
        if(image && (type==='restore' || type === 'removeBackground')){
          setNewTransformation(transformationType.config)
        }
      },[image, transformationType?.config, type])


  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {creditBalance <Math.abs(creditFee) && <InsufficientCreditsModal/>}
     <CustomField
     control={form.control}
     name ="title"
     formLabel="Image Title"
     className="w-full"
     render={({field}) => <Input{...field}
    className="input-field"/>}
     />

     {type === 'fill' && (
      <CustomField
      control={form.control}
      name ="aspectRatio"
      formLabel="Aspect Ratio"
      className="w-full"
      
      render={({field})=>(
        <Select
         onValueChange={(value)=>
          onSelectFieldHandler(value,field.
            onChange)
         }>
  <SelectTrigger className="select-field">
    <SelectValue placeholder="Select size" />
  </SelectTrigger>
  <SelectContent>
   {Object.keys(aspectRatioOptions).map
   ((key)=>(
    <SelectItem key ={key} value={key}
    className="select-item">
      {aspectRatioOptions[key as
        AspectRatioKey].label}
    </SelectItem>
   ))}
  </SelectContent>
</Select>

      )}
      />
     )}

     {(type === 'remove' || type === 'recolor')&&(
      <div className="promt-field">
        <CustomField
        control ={form.control}
        name="promt"
        formLabel={
          type === 'remove' ? 'Object to remove' :'Object  to recolor'

        }
        className="w-full"
        render={(({field}) => (
          <Input
          value={field.value}
          className="input-field"
          onChange ={(e) => onInputChangehandler(
            'promt',
            e.target.value,
            type,
            field.onChange
          )}
          />
        )
        )}
        />

{type === 'recolor' && (
  <CustomField
    control={form.control}
    name="color"
    formLabel="Replacment Color"
    className="w-full"
    render={({ field }) => (
      <Input
      value={field.value}
      className="input-field"
      onChange ={(e) => onInputChangehandler(
        'color',
        e.target.value,
        'recolor',
        field.onChange
      )}
      />
    )}
  />
)}
      </div>
     )}


     <div className="media-uploader-field">
      <CustomField
      control={form.control}
      // pub="publicId"
      name='publidId'
      className="flex size-full flex-col"
      render={({ field }) => (
      <MediaUploader
        onValueChange={field.onChange}
        setImage={setImage}
        image={image}
        type={type}
        publicId={field.value}
      />
    )}
  />
  <TransformedImage
   image={image}
   type={type}
   title={form.getValues().title}
   isTransforming={isTransforming}
   setIsTransforming={SetIsTransforming}
   transformationConfig={transformationConfig}
  />
</div>


     <div className="flex flex-col gap-4">

     <Button 
     type="button"
     className="submit-button capitalize"
     disabled={isTransforming || newTransformation
      === null}
      onClick={onTransformHandler}
     >
    {isTransforming ? 'Transforming...' : 'Apply transformation'}

      </Button>

     
     </div>
    </form>
  </Form>
  )
}

export default TransformationForm
