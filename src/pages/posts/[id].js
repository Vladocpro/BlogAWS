import React,{useEffect,useState} from 'react';
import {API,Storage} from "aws-amplify";
import {useRouter} from "next/router";
import "../../../configureAmplify"
import {getPost,listPosts} from "./../../graphql/queries";
import ReactMarkDown from "react-markdown";
import {createComment} from "./../../graphql/mutations";
import {v4 as uuid} from "uuid"
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false })
import "easymde/dist/easymde.min.css";


const initialState = {message: ""}

export default function Post ({post})  {
   const router = useRouter();
   const [coverImage, setCoverImage] = useState(null);
   const [comment, setComment] = useState(initialState)
   const [showMe, setShowMe] = useState(false)

   const { message } = comment;

   useEffect(() => {
      updateCoverImage();
   },[]);

   const toggle = () => {
      setShowMe(!showMe)
   }
   const updateCoverImage = async () => {
      if(post.coverImage) {
         const imageKey = await Storage.get(post.coverImage)
         setCoverImage(imageKey)
      }
   }
   const createTheComment = async () => {
      if(!message) return
      const id = uuid();
      comment.id = id;
      try {
         await API.graphql({
            query: createComment,
            variables: {input: comment},
            authMode: "AMAZON_COGNITO_USER_POOLS"
         })
      } catch (error) {
         console.log(error)
      }
      router.push("/my-posts")
   }

   if(router.isFallback) {
      return <div>Loading...</div>
   }
   return (
       <div>
          <h1 className="text-5xl mt-4 font-semibold tracing-wide">
             {post.title}
          </h1>
          {
             coverImage && (
                  <img src={coverImage} alt="" className="mt-4"/>
              )
          }
          <p className="text-sm font-light my-4">By {post.username}</p>
          <div className="mt-8">
             <ReactMarkDown className="prose" children={post.content} />
          </div>
          <div>
             <button type="button" className="mb-2 bg-green-600 text-white font-semibold mt-6 px-8 py-2 rounded-lg" onClick={toggle}>
                Write a comment
             </button>
             {
                <div style={{display: showMe ? "block" : "none"}}>
                   <SimpleMDE value={comment.message} onChange={(value) => setComment({...comment, message: value, postID: post.id})}/>
                   <button type="button" onClick={createTheComment} className="mb-4 bg-blue-600 text-white font-semibold px-8 py-2 rounded-lg" >
                      Save
                   </button>
                </div>
             }
             {
                 post.comments.items.length > 0 && post.comments.items.map((comment, index) => (
                     <div key={index} className="py-8 px-8 max-w-xl mx-auto bg-white shadow-lg rounded-lg space-y-2
                                    sm:py-1 sm:flex my-6 mx-2 sm:items-center sm:space-y-0 sm:space-x-6 mb-2">
                        <div>
                           <p className="text-black-500 mt-2">
                              {comment.message}
                           </p>
                           <p className="text-gray-400 mt-1">
                              {comment.createdBy}
                           </p>
                        </div>
                     </div>
                 ))
             }
          </div>
       </div>
   );
};

export async function getStaticPaths() {
   const postData = await API.graphql({query: listPosts})
   const paths = postData.data.listPosts.items.map(post => ({ params: {id: post.id}}))
   return {
      paths,
      fallback: true
   }

};

export async function getStaticProps({params}) {
   const {id} = params
   const postData = await API.graphql({query: getPost, variables: {id}})
   return {
      props: {
         post: postData.data.getPost
      },
      revalidate: 1
   }
};