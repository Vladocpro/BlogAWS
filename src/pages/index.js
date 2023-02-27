import {API,graphqlOperation,Storage} from "aws-amplify";
import {listPosts} from "./../graphql/queries";
import {useEffect,useState} from "react";
import Link from "next/link";
import {newOnCreatePost} from "./../graphql/subscriptions";

export default function Home() {
  const [posts, setPosts] = useState([])
  const [post, setPost] = useState([])
  let subOnCreate;

   const setUpSubscriptions = () => {
     subOnCreate = API.graphql(graphqlOperation(newOnCreatePost)).subscribe({
        next: (postData) => {
           console.log(postData)
           setPost(postData)
        }
     })
   }

  const fetchPosts = async () => {
    const postData = await API.graphql({
      query: listPosts
    })
    const { items } = postData.data.listPosts
    const postWithImages = await Promise.all(
        items.map(async (post) => {
           if(post.coverImage) {
              post.coverImage = await Storage.get(post.coverImage)
           }
           return post
        })
    )
    setPosts(postWithImages)
  }

   useEffect(() => {
      setUpSubscriptions();
      return () => {
         subOnCreate.unsubscribe();
      }
   }, [])

   useEffect(() => {
      fetchPosts();
   }, [post])


  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-wide mt-6 mb-8">Posts</h1>
       <div>
          {posts.map((post, index) => {
                return (
                    <Link key={index} href={`/posts/${post.id}`}>
                       <div className="my-6 pb-6 border-b border-gray-300">
                          {
                             post.coverImage && (
                                  <img src={post.coverImage} alt=""
                                       className="w-36 h-36 bg-contain bg-center rounded-full sm:mx-0 sm:shrink-0"/>
                              )
                          }
                          <div className="cursor-pointer mt-2">

                             <h2 className="text-xl font-semibold" key={post.id}>{post.title}</h2>
                             <p className="text">Author: {post.username}</p>
                             {
                                post.comments.items?.length > 0 && post.comments.items.map((comment, index) => (
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
                    </Link>
                )
          })}
       </div>
    </div>
  )
}
