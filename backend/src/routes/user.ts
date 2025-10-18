import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { sign, verify } from "hono/jwt";
import { signupInput, signinInput } from "@batxdev/medium-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const {success} = signupInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Inputs invalid"
      })
    }
    //sanatize the body

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
  } catch (e: any) {
    // Log error for debugging
    if (e.code === 'P2002') {
      c.status(403);
      return c.json({ error: "User already exists" });
    }
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});

userRouter.post("/signin", async(c) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const {success} = signinInput.safeParse(body);
    if(!success){
      c.status(411);
      return c.json({
        message: "Inputs invalid"
      })
    }

    const user = await prisma.user.findUnique({
      where : {
        email : body.email,
        password : body.password,
      }
    })
    if(!user){
      c.status(403);
      return c.json({error: "Invalid credentials"});
    }
    const jwt = await sign({
      id: user.id
    }, c.env.JWT_SECRET);

    return c.json({ jwt });
  }
  catch(e: any){
    // Log error for debugging
    c.status(500);
    return c.json({error: "Internal server error"});
  }
});
