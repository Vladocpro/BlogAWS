import {API, Storage} from "aws-amplify";
import {useRouter} from "next/router";
import "../../../configureAmplify"
import {getPost} from "./../../graphql/queries";
import React,{useEffect,useRef,useState} from 'react';
import Link from "next/link";
import {updatePost} from "./../../graphql/mutations";
import {v4 as uuid} from "uuid";
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false })
import "easymde/dist/easymde.min.css";


const EditPost = () => {
   const [post, setPost] = useState(null)
   const [coverImage, setCoverImage] = useState(null);
   const [localImage, setLocalImage] = useState(null)
   const [fileInput, setFileInput] = useRef(null)
   const router = useRouter();
   const {id} = router.query

   useEffect(() => {
      const fetchPost = async () => {
         if(!id) return
         const postData = await API.graphql({
            query: getPost,
            variables: {id}
         })
         setPost(postData.data.getPost)
         if(postData.data.getPost.coverImage) {
            updateCoverImage(postData.data.getPost.coverImage)
         }
      }
      fetchPost();

   },[id]);


   if(!post) return null;
   const updateCoverImage = async (coverImage) => {
      const imageKey = await Storage.get(coverImage);
      setCoverImage(imageKey)
   }

   const uploadImage = async () => {
      fileInput.current.click()
   }

   const handleChange = (e) => {
      const fileUploaded = e.target.files[0];
      if(!fileUploaded) return
      setCoverImage(fileUploaded)
      setLocalImage(URL.createObjectURL(fileUploaded))
   }

   const onChange = (e) => {
      setPost(() => ({...post, [e.target.name]: e.target.value}))
   }

   const {title, content} = post;
   const updateCurrentPost = async () => {
      if(!title || !content) return
      const postUpdated = {
         id,
         content,
         title
      }
      if(coverImage && localImage) {
         const fileName = `${coverImage.name}_${uuid()}`
         postUpdated.coverImage = fileName;
         await Storage.put(fileName, coverImage)
      }
      await API.graphql({
         query: updatePost,
         variables: {input: postUpdated},
         authMode: "AMAZON_COGNITO_USER_POOLS"
      })
      router.push("/my-posts")
   }

   return (
       <div>
          <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-2">
             Edit Post
          </h1>
          {
             coverImage && (
                  <img src={localImage ? localImage : coverImage} alt="" className="mt-4"/>
              )
          }
          <input
              name="title"
              placeholder="Title"
              value={post.title}
              onChange={onChange}
              className="border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-500 placeholder-gray-500 y-2"
          />
          <SimpleMDE
          value={post.content}
          onChange={(value) => setPost({...post, content: value})}
          />
          <input type="file" ref={fileInput}  className="absolute w-0  h-0" onChange={handleChange}/>
          <button
              onClick={uploadImage}
              className="mb-4 bg-green-600 text-white font-semibold px-8 py-2 rounded-lg"
          >
             Upload Cover Image
          </button>
          <button
              onClick={updateCurrentPost}
              className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg"
          >
             Update Post
          </button>
       </div>
   );
};

export default EditPost;




