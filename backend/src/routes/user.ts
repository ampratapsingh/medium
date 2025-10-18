import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { PrismaClient } from "../generated/prisma/edge";
import { sign, verify } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
  } catch (e: any) {
    if (e.code === 'P2002') {
      c.status(403);
      return c.json({ error: "User already exists" });
    }
    throw e;
  }
});

userRouter.post("/signin", async(c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try{
    const body = await c.req.json();
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
    if(e.code === 'P2002'){
      c.status(403);
      return c.json({error: "Invalid credentials"});
    }
    throw e;
  }
});
