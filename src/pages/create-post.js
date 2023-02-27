import {withAuthenticator} from "@aws-amplify/ui-react";
import React,{useState, useRef} from "react";
import {API,Storage} from "aws-amplify";
import {useRouter} from "next/router";
import {v4 as uuid} from "uuid"
import {createPost} from "../graphql/mutations";
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false })
import "easymde/dist/easymde.min.css";


const initialState = {title: "", content: ""}
const CreatePost = () => {
   const [post, setPost] = useState(initialState)
   const {title, content} = post
   const router = useRouter()
   const [image, setImage] = useState(null)
   const imageFileInput = useRef(null)
   const onChange = (e) => {
      setPost(() => ({...post, [e.target.name]: e.target.value}))
   }

   const createNewPost = async () => {
      if(!title || !content) return;
      const id = uuid();
      post.id = id;

      if(image) {
         const filename = `${image.name}_${uuid()}`
         post.coverImage = filename;
         await Storage.put(filename, image)
      }

      await API.graphql({
         query: createPost,
         variables: {input: post},
         authMode: "AMAZON_COGNITO_USER_POOLS"
      })
      await router.push(`/posts/${id}`)
   }

   const uploadImage = async () => {
      imageFileInput.current.click()
   }

   const handleChange = (e) => {
      const fileUploaded = e.target.files[0];
      if(!fileUploaded) return
      setImage(fileUploaded)
   }


   return (
       <div>
          <div className="text-3xl font-semibold tracking-wide mt-6">Create new post</div>
          <input
              onChange={onChange}
              name="title"
              placeholder="Title"
              value={post.title}
              className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
          />
          {
             image && (
              <img src={URL.createObjectURL(image)} alt="" className="my-4"/>
              )
          }
          <SimpleMDE
              value={post.content}
              onChange={(value) => setPost({...post, content: value})}
          />

          <input type="file" ref={imageFileInput} className="absolute w-0 h-0" onChange={handleChange}/>
          <button type="button"
                  className="bg-green-600 text-white font-semibold px-8 py-2 rounded-lg mr-2 ml-3"
                  onClick={uploadImage}
          >
             Upload Cover Image
          </button>
          <button type="button"
          className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
          onClick={createNewPost}
          >
             Create Post
          </button>

       </div>
   );
};

export default withAuthenticator(CreatePost);


