import { Document,Schema,model,models } from "mongoose";
import { string } from "zod";

 export interface IImage extends Document {
    title: string;
    transformationTypes: string;
    publicID: string;
    secureURL:string;
    width?: number;
    height?: number;
    config?: object;
    transformationURL?:string;
    aspectRatio?: string;
    color?: string;
    prompt?: string;
    author?: {
        _id:string;
        firstName : string;
        lastName :string;
    }
    createdAt?: Date;
    updatedAt?: Date;
  }

const ImageSchema = new Schema({
    title: {type: String,required:true},
    transformationTypes:{type:String,required:true},
    publicID:{type:String,required:true},
    secureURL:{type:string,required:true},
    width:{type:Number},
    height:{type:Number},
    config:{type:Object},
    transformationURL:{type:string},
    aspectRatio:{type:String},
    color:{type:String},
    promt:{type:String},
    author:{type:Schema.Types.ObjectId,ref:'User'},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},


});

const Image =models?.Image || model('Image',ImageSchema);
export default Image;

