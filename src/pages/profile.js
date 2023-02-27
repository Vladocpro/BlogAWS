import {withAuthenticator, AmplifySignOut} from "@aws-amplify/ui-react";
import {Auth} from "aws-amplify";

import React,{useEffect,useState} from 'react';

const Profile = () => {
   const [user, setUser] = useState(null)

   useEffect(() => {
      checkUser()
   },[]);

   const checkUser = async () => {
      const user = await Auth.currentAuthenticatedUser()
      setUser(user)
   }
   if(!user) return null
   else return (
       <div>
          <h1 className="text-3xl font-semibold tracking-wide mt-6">Profile</h1>
          <h1 className="font-medium text-gray-500 my-2">
             Username: {user.username}
          </h1>
          <p className="text-small text-gray-500 mb-6">
             Email: {user.attributes.email}
          </p>
          <AmplifySignOut/>
       </div>
   )
};

export default withAuthenticator(Profile);

