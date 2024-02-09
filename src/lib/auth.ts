import NextAuth from "next-auth"
import CredentialsProvider  from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import prisma from "./prisma";
import * as bcrypt from "bcrypt";

const credentialsConfig = CredentialsProvider ({
  
  credentials: {
    username: { label: "Username", type: "text", placeholder: "jsmith" },
    password: {  label: "Password", type: "password" }
  },
  
  async authorize(credentials) {
       
      const user = await prisma.user.findUnique({
          where: {
            email: credentials?.username as string,
            
          },
        });

        if (!user) throw new Error("User name or password is not correct");

        // This is Naive Way of Comparing The Passwords
        // const isPassowrdCorrect = credentials?.password === user.password;
        if (!credentials?.password) throw new Error("Please Provide Your Password");
        const isPassowrdCorrect = await bcrypt.compare(credentials.password as string, user.password);

        if (!isPassowrdCorrect) throw new Error("User name or password is not correct");

        if (!user.emailVerified) throw new Error("Please verify your email first!");

       
        return user;
      },
    
})
export const { handlers:{GET,POST}, auth } = NextAuth({ providers: [ GitHub,credentialsConfig ] })